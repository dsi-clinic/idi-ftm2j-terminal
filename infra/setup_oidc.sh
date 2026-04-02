#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
#  GitHub Actions OIDC Setup Script
#  Creates an IAM OIDC provider for GitHub
#  Actions and an IAM role your workflow can
#  assume via OIDC (no long-lived credentials).
# ─────────────────────────────────────────────

REGION="us-east-2"
GITHUB_OIDC_URL="https://token.actions.githubusercontent.com"
GITHUB_OIDC_HOST="token.actions.githubusercontent.com"

echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│   GitHub Actions OIDC Setup                 │"
echo "└─────────────────────────────────────────────┘"
echo ""

# ── Prompt for inputs ──────────────────────────────────────────────────────────

read -rp "Enter your AWS Account ID (12 digits): " AWS_ACCOUNT_ID
if [[ ! "$AWS_ACCOUNT_ID" =~ ^[0-9]{12}$ ]]; then
  echo "ERROR: AWS Account ID must be exactly 12 digits." >&2
  exit 1
fi

read -rp "Enter your GitHub repo (format: org-or-user/repo-name): " GITHUB_REPO
if [[ ! "$GITHUB_REPO" =~ ^[^/]+/[^/]+$ ]]; then
  echo "ERROR: Repo must be in the format owner/repo." >&2
  exit 1
fi

GITHUB_ORG=$(echo "$GITHUB_REPO" | cut -d'/' -f1)
GITHUB_REPO_NAME=$(echo "$GITHUB_REPO" | cut -d'/' -f2)

read -rp "Enter the IAM role name to create [default: ftm2j-idi-dev-github-s3-read]: " ROLE_NAME
ROLE_NAME="${ROLE_NAME:-ftm2j-idi-dev-github-s3-read}"

echo ""
echo "── Configuration Summary ──────────────────────────────"
echo "  AWS Account ID : $AWS_ACCOUNT_ID"
echo "  Region         : $REGION"
echo "  GitHub Repo    : $GITHUB_REPO"
echo "  IAM Role       : $ROLE_NAME"
echo "───────────────────────────────────────────────────────"
read -rp "Proceed? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo ""

# ── Step 1: Create GitHub OIDC Identity Provider ──────────────────────────────

echo "[1/3] Setting up GitHub OIDC identity provider ..."

# Construct the expected provider ARN directly rather than relying on a
# JMESPath query, then check for it with a targeted get call.
EXPECTED_PROVIDER_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/${GITHUB_OIDC_HOST}"

if aws iam get-open-id-connect-provider \
    --open-id-connect-provider-arn "$EXPECTED_PROVIDER_ARN" \
    > /dev/null 2>&1; then
  echo "    ✓ OIDC provider already exists: $EXPECTED_PROVIDER_ARN"
  OIDC_PROVIDER_ARN="$EXPECTED_PROVIDER_ARN"
else
  # --thumbprint-list is required by the CLI but no longer validated by AWS.
  # Any 40-character hex string is acceptable.
  OIDC_PROVIDER_ARN=$(aws iam create-open-id-connect-provider \
    --url "$GITHUB_OIDC_URL" \
    --client-id-list "sts.amazonaws.com" \
    --thumbprint-list "0000000000000000000000000000000000000000" \
    --query "OpenIDConnectProviderArn" \
    --output text)
  echo "    ✓ OIDC provider created: $OIDC_PROVIDER_ARN"
fi

# ── Step 2: Create IAM role with trust policy ──────────────────────────────────

echo "[2/3] Setting up IAM role: $ROLE_NAME ..."

TRUST_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_ORG}/${GITHUB_REPO_NAME}:*"
        }
      }
    }
  ]
}
EOF
)

if aws iam get-role --role-name "$ROLE_NAME" > /dev/null 2>&1; then
  echo "    ✓ Role already exists, updating trust policy ..."
  aws iam update-assume-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-document "$TRUST_POLICY"
  ROLE_ARN=$(aws iam get-role \
    --role-name "$ROLE_NAME" \
    --query "Role.Arn" \
    --output text)
else
  ROLE_ARN=$(aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document "$TRUST_POLICY" \
    --description "GitHub Actions OIDC role for ${GITHUB_REPO}" \
    --query "Role.Arn" \
    --output text)
  echo "    ✓ IAM role created: $ROLE_ARN"
fi

# ── Step 3: Attach access policies to role (idempotent — put overwrites) ─

echo "[3/3] Attaching permissions to role ..."

GITHUB_ACTION_POLICY=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3",
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetObject", "s3:GetObjectAttributes"],
      "Resource": "*"
    }
  ]
}
EOF
)

aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "ftm2j-idi-dev-github-s3-read" \
  --policy-document "$GITHUB_ACTION_POLICY"

echo "    ✓ GitHub Actions access policy attached."

# ── Done ───────────────────────────────────────────────────────────────────────

echo ""
echo "┌─────────────────────────────────────────────────────────────────┐"
echo "│  ✅ OIDC setup complete!                                         │"
echo "└─────────────────────────────────────────────────────────────────┘"
echo ""
echo "  IAM Role ARN : ${ROLE_ARN}"
echo ""
echo "Set the following in your GitHub Actions variables:"
echo ""
echo "  AWS_OIDC_ROLE = ${ROLE_ARN}"
echo "  AWS_REGION    = ${REGION}"
echo ""
echo "Ensure your workflow job has these permissions:"
echo ""
echo "  permissions:"
echo "    id-token: write"
echo "    contents: read"
echo ""
echo "And this step to assume the role:"
echo ""
echo "  - name: Configure AWS credentials"
echo "    uses: aws-actions/configure-aws-credentials@v4"
echo "    with:"
echo "      role-to-assume: \${{ vars.AWS_OIDC_ROLE }}"
echo "      aws-region: \${{ vars.AWS_REGION }}"
echo ""