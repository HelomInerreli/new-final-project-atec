import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Wrench } from "lucide-react";
import type { ServiceFinanceItem } from "../../interfaces/finance";
import { formatCurrency } from "../../utils/currencyUtils";

interface ServicesTableProps {
    services: ServiceFinanceItem[];
}

export function ServicesTable({ services }: ServicesTableProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Receita por Serviço (Top 10)
                </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Serviço</TableHead>
                            <TableHead className="text-right">Qtd</TableHead>
                            <TableHead className="text-right">Receita</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.slice(0, 10).map((svc) => (
                            <TableRow key={svc.service_id}>
                                <TableCell className="font-medium">
                                    {svc.service_name}
                                </TableCell>
                                <TableCell className="text-right">
                                    {svc.count}
                                </TableCell>
                                <TableCell className="text-right font-bold text-green-600">
                                    {formatCurrency(svc.total_revenue)}
                                </TableCell>
                            </TableRow>
                        ))}
                        {services.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">
                                    Sem dados no período.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
