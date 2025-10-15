'use client';

import { useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ProductSelector } from './ProductSelector';

export function InvoiceLineItems({ control }: { control: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'line_items',
  });

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="w-[100px]">Quantity</TableHead>
            <TableHead className="w-[150px] text-right">Unit Price</TableHead>
            <TableHead className="w-[150px] text-right">Total</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, index) => (
            <TableRow key={field.id}>
              <TableCell>
                <ProductSelector
                  control={control}
                  index={index}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  {...control.register(`line_items.${index}.quantity`)}
                  defaultValue={1}
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  readOnly
                  {...control.register(`line_items.${index}.unit_price`)}
                />
              </TableCell>
              <TableCell className="text-right">
                {/* This should update dynamically */}
              </TableCell>
              <TableCell>
                <Button variant="ghost" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={() => append({ product_id: '', quantity: 1, unit_price: 0 })}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Line Item
      </Button>
    </div>
  );
}
