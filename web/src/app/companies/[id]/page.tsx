// Standard library imports
import fs from "fs";

const companies = JSON.parse(
  fs.readFileSync(process.env.INPUT_DATA_FILE_PATH || "", "utf-8"),
);

type Company = (typeof companies)[number];

export async function generateStaticParams() {
  return companies.map((company: Company) => ({ id: company.id }));
}

type CompanyPageParams = {
  params: Promise<{ id: string }>;
};

const CompanyPage = async ({ params }: CompanyPageParams) => {
  const { id } = await params;
  const company = companies.find((c: Company) => c.id === id);
  return (
    <article data-pagefind-body>
      <div data-pagefind-meta="permId">{company.permId}</div>
      <div data-pagefind-meta="ticker">{company.ticker}</div>
      <div data-pagefind-meta="companyName" data-pagefind-weight="2.0">
        {company.name}
      </div>
      <div data-pagefind-meta="countryName">{company.country}</div>
      <div data-pagefind-meta="countryCode">{company.countryCode}</div>
      <div data-pagefind-meta="subsidiaries">{company.subsidiaries}</div>
      <div data-pagefind-meta="sectors">{company.sectors}</div>
    </article>
  );
};

export default CompanyPage;
