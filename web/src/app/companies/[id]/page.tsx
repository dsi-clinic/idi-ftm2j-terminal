// Standard library imports
import fs from "fs";

const companies = JSON.parse(
  fs.readFileSync(process.env.INPUT_DATA_FILE_PATH || "", "utf-8"),
);

type Company = (typeof companies)[number];

export async function generateStaticParams() {
  return companies.map((c: Company) => ({ id: c.permId }));
}

type CompanyPageParams = {
  params: Promise<{ id: string }>;
};

const CompanyPage = async ({ params }: CompanyPageParams) => {
  const { id } = await params;
  const company = companies.find((c: Company) => c.permId === id);

  return (
    <article data-pagefind-body>
      <div data-pagefind-meta="permId">{company.permId}</div>
      <div data-pagefind-meta="companyName" data-pagefind-weight="2.0">
        {company.name}
      </div>
      <div data-pagefind-meta="countryName">{company.country}</div>
      <div data-pagefind-meta="countryCode">{company.countryCode}</div>
      <div data-pagefind-meta="tickers">{JSON.stringify(company.tickers)}</div>
      <div data-pagefind-meta="subsidiaries">
        {JSON.stringify(company.subsidiaries)}
      </div>
      <div data-pagefind-meta="sectors">{JSON.stringify(company.sectors)}</div>
    </article>
  );
};

export default CompanyPage;
