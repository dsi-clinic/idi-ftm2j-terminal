// Standard library imports
import fs from "fs";
import { notFound } from "next/navigation";

interface CompanyData {
  permId: string;
  name: string;
  country: string;
  countryCode: string;
  tickers: string[];
  subsidiaries: string[];
  sectors: string[];
}

function loadCompanies(): CompanyData[] {
  const filePath = process.env.INPUT_DATA_FILE_PATH;
  if (!filePath || !fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return loadCompanies().map((c) => ({ id: c.permId }));
}

type CompanyPageParams = {
  params: Promise<{ id: string }>;
};

const CompanyPage = async ({ params }: CompanyPageParams) => {
  const { id } = await params;
  const company = loadCompanies().find((c) => c.permId === id);
  if (!company) notFound();

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
