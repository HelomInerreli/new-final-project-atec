import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import type { FinanceOverview } from "../../interfaces/finance";
import { formatCurrency } from "../../utils/currencyUtils";

interface FinanceKPICardsProps {
    overview: FinanceOverview | null;
}

export function FinanceKPICards({ overview }: FinanceKPICardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Receita Total
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(overview?.total_revenue || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {overview?.total_invoices || 0} faturas pagas
                    </p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Despesas (Inventário)
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(overview?.total_expenses || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Custo total do stock
                    </p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lucro Potencial</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(overview?.total_profit || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Se vender todo o stock
                    </p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {overview && overview.total_revenue > 0
                            ? ((overview.total_profit / overview.total_revenue) * 100).toFixed(1)
                            : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Margem sobre vendas
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
