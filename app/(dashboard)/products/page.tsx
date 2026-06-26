"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { TechBadge } from "@/components/tech-badge";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Package,
} from "lucide-react";

const initialProducts = [
  { id: "1", sku: "ELT-001", name: "Resistor 10kΩ", category: "Eletrônicos", description: "Resistor de filme de carbono", unit: "un", cost: 0.08, price: 0.15, stock: 150, min_stock: 50, active: true },
  { id: "2", sku: "ELT-002", name: "Capacitor 100µF", category: "Eletrônicos", description: "Capacitor eletrolítico", unit: "un", cost: 0.25, price: 0.45, stock: 80, min_stock: 30, active: true },
  { id: "3", sku: "MEC-042", name: "Parafuso M8 x 30mm", category: "Mecânica", description: "Parafuso de aço inox", unit: "un", cost: 0.03, price: 0.08, stock: 12, min_stock: 100, active: true },
  { id: "4", sku: "HID-007", name: "Óleo Hidráulico AW68", category: "Hidráulica", description: "Óleo hidráulico para sistemas industriais", unit: "l", cost: 28.00, price: 45.90, stock: 2, min_stock: 20, active: true },
  { id: "5", sku: "FERR-09", name: "Chave Allen 5mm", category: "Ferramentas", description: "Chave Allen sextavada", unit: "un", cost: 7.50, price: 12.50, stock: 1, min_stock: 15, active: false },
];

const units = [
  { value: "un", label: "Unidade" },
  { value: "kg", label: "Quilograma" },
  { value: "g", label: "Grama" },
  { value: "l", label: "Litro" },
  { value: "ml", label: "Mililitro" },
  { value: "cx", label: "Caixa" },
  { value: "pc", label: "Peça" },
];

const categories = ["Eletrônicos", "Mecânica", "Hidráulica", "Químicos", "Ferramentas", "Insumos"];

export default function ProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<typeof initialProducts[0] | null>(null);

  const filtered = products.filter(
    (p) =>
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (p: typeof initialProducts[0]) => {
    setEditingProduct(p);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Products</h1>
          <p className="text-sm text-text-muted mt-1">
            {filtered.length} products · Manage your product catalog
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by SKU, name, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-3 rounded-[4px] border border-border-default bg-bg-surface text-sm text-text-primary placeholder:text-text-muted/60 focus:border-brand/40 focus:ring-1 focus:ring-brand/20 transition-colors outline-none"
        />
      </div>

      {/* Table */}
      <div className="rounded-[6px] border border-border-default overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <span className="font-mono text-xs text-brand">{p.sku}</span>
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  <span className="text-xs text-text-muted">{p.category}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-text-secondary">{p.unit}</span>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  R$ {p.cost.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  R$ {p.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  <span className={p.stock <= p.min_stock ? "text-brand-danger" : "text-text-primary"}>
                    {p.stock}
                  </span>
                </TableCell>
                <TableCell>
                  {p.active ? (
                    <TechBadge variant="green">ACTIVE</TechBadge>
                  ) : (
                    <TechBadge variant="red">INACTIVE</TechBadge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)}>
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-brand-danger hover:text-brand-danger">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <Package className="h-8 w-8" />
                    <p className="text-sm">No products found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? "Edit Product" : "New Product"}
        description={editingProduct ? `Editing ${editingProduct.sku}` : "Create a new product in your catalog"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU"
              placeholder="e.g., ELT-001"
              defaultValue={editingProduct?.sku}
            />
            <Input
              label="Name"
              placeholder="e.g., Resistor 10kΩ"
              defaultValue={editingProduct?.name}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                Category
              </label>
              <select className="flex h-10 w-full rounded-[4px] border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary appearance-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20 transition-colors outline-none">
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 tracking-wide uppercase">
                Unit
              </label>
              <select className="flex h-10 w-full rounded-[4px] border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary appearance-none focus:border-brand/40 focus:ring-1 focus:ring-brand/20 transition-colors outline-none">
                {units.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Description"
            placeholder="Optional description"
            defaultValue={editingProduct?.description}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cost (R$)"
              type="number"
              step="0.01"
              placeholder="0.00"
              defaultValue={editingProduct?.cost}
            />
            <Input
              label="Price (R$)"
              type="number"
              step="0.01"
              placeholder="0.00"
              defaultValue={editingProduct?.price}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Stock"
              type="number"
              placeholder="0"
              defaultValue={editingProduct?.min_stock}
            />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>
              {editingProduct ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  );
}
