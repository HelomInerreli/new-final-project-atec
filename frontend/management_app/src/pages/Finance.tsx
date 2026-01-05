import { useFinance } from "../hooks/useFinance";
import { FinanceHeader } from "../components/finance/FinanceHeader";
import { FinanceKPICards } from "../components/finance/FinanceKPICards";
import { PartsTable } from "../components/finance/PartsTable";
import { ServicesTable } from "../components/finance/ServicesTable";

export default function Finance() {
    const {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        loading,
        overview,
        parts,
        services,
        handleFilter,
    } = useFinance();

    return (
        <div className="space-y-6">
            <FinanceHeader
                startDate={startDate}
                endDate={endDate}
                loading={loading}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onFilter={handleFilter}
            />

            <FinanceKPICards overview={overview} />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <PartsTable parts={parts} />
                <ServicesTable services={services} />
            </div>
        </div>
    );
}
