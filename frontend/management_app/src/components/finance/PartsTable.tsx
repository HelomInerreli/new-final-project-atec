import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Package } from "lucide-react";
import type { PartFinanceItem } from "../../interfaces/finance";
import { formatCurrency } from "../../utils/currencyUtils";

interface PartsTableProps {
    parts: PartFinanceItem[];
}

export function PartsTable({ parts }: PartsTableProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Lucro Potencial por Peça (Inventário)
                </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Peça</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Custo/Un.</TableHead>
                            <TableHead className="text-right">Venda/Un.</TableHead>
                            <TableHead className="text-right">Lucro/Un.</TableHead>
                            <TableHead className="text-right">Custo Total</TableHead>
                            <TableHead className="text-right">Valor Total</TableHead>
                            <TableHead className="text-right">Lucro Total</TableHead>
                            <TableHead className="text-right">Margem %</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parts.slice(0, 10).map((part) => {
                            const stock = part.quantity_sold;
                            const costPerUnit = stock > 0 ? part.total_cost / stock : 0;
                            const salePerUnit = stock > 0 ? part.total_revenue / stock : 0;
                            const profitPerUnit = salePerUnit - costPerUnit;
                            const marginPercent = part.total_revenue > 0 
                                ? (part.total_profit / part.total_revenue) * 100 
                                : 0;
                            
                            return (
                                <TableRow key={part.part_number}>
                                    <TableCell className="font-medium">
                                        <div>{part.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {part.part_number}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {stock}
                                    </TableCell>
                                    <TableCell className="text-right text-red-500 text-sm">
                                        {formatCurrency(costPerUnit)}
                                    </TableCell>
                                    <TableCell className="text-right text-green-600 text-sm">
                                        {formatCurrency(salePerUnit)}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-blue-600 text-sm">
                                        {formatCurrency(profitPerUnit)}
                                    </TableCell>
                                    <TableCell className="text-right text-red-500">
                                        {formatCurrency(part.total_cost)}
                                    </TableCell>
                                    <TableCell className="text-right text-green-600">
                                        {formatCurrency(part.total_revenue)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-blue-700">
                                        {formatCurrency(part.total_profit)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {marginPercent.toFixed(1)}%
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {parts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center">
                                    Sem produtos no inventário.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
