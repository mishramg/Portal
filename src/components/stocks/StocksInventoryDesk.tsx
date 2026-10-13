import React, { useState } from 'react';
import { MaterialStockItem, UserAccount } from '../../types';
import { 
  Boxes, 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  MinusCircle, 
  PlusCircle, 
  RefreshCw, 
  Warehouse, 
  ShieldAlert, 
  FileSpreadsheet, 
  TrendingDown, 
  Calendar, 
  IndianRupee,
  Layers,
  Sparkles,
  ArrowDownRight,
  PackageCheck,
  X
} from 'lucide-react';

interface StocksInventoryDeskProps {
  stocks: MaterialStockItem[];
  activeUser: UserAccount;
  onUpdateStock: (updatedItem: MaterialStockItem) => void;
  onAddStockItem?: (newItem: MaterialStockItem) => void;
  onDeductStock?: (itemId: string, quantity: number, projectName: string) => void;
}

export const StocksInventoryDesk: React.FC<StocksInventoryDeskProps> = ({
  stocks,
  activeUser,
  onUpdateStock,
  onAddStockItem,
  onDeductStock
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'CRITICAL_OUT_OF_STOCK'>('ALL');

  // Deduction Modal State
  const [deductItem, setDeductItem] = useState<MaterialStockItem | null>(null);
  const [deductQty, setDeductQty] = useState<number>(5);
  const [deductProject, setDeductProject] = useState<string>('Haldirams Flagship Store - Noida Sector 18');
  const [deductNotes, setDeductNotes] = useState<string>('');

  // Restock Modal State
  const [restockItem, setRestockItem] = useState<MaterialStockItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(20);
  const [restockRate, setRestockRate] = useState<number>(0);

  // New Item Modal State
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItemCode, setNewItemCode] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<MaterialStockItem['category']>('ACRYLIC');
  const [newItemUnit, setNewItemUnit] = useState('Sheets');
  const [newItemStock, setNewItemStock] = useState<number>(50);
  const [newItemMinThreshold, setNewItemMinThreshold] = useState<number>(20);
  const [newItemUnitCost, setNewItemUnitCost] = useState<number>(1800);
  const [newItemLocation, setNewItemLocation] = useState('Bay A-3, Central Warehouse');

  const filteredStocks = stocks.filter((item) => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.itemCode.toLowerCase().includes(q) ||
      item.warehouseLocation.toLowerCase().includes(q)
    );
  });

  // KPI Calculations
  const totalItemsCount = stocks.length;
  const totalInventoryValuation = stocks.reduce((sum, s) => sum + s.currentStock * s.unitCost, 0);
  const lowStockCount = stocks.filter((s) => s.status === 'LOW_STOCK' || s.currentStock <= s.minimumThreshold).length;
  const criticalCount = stocks.filter((s) => s.status === 'CRITICAL_OUT_OF_STOCK' || s.currentStock <= 0).length;

  const handleConfirmDeduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deductItem) return;
    const qtyToDeduct = Math.max(1, deductQty);
    const newStock = Math.max(0, deductItem.currentStock - qtyToDeduct);
    const newStatus: MaterialStockItem['status'] = 
      newStock === 0 
        ? 'CRITICAL_OUT_OF_STOCK' 
        : newStock <= deductItem.minimumThreshold 
        ? 'LOW_STOCK' 
        : 'IN_STOCK';

    const updated: MaterialStockItem = {
      ...deductItem,
      currentStock: newStock,
      reservedForProjects: Math.max(0, deductItem.reservedForProjects - qtyToDeduct),
      status: newStatus
    };

    onUpdateStock(updated);
    if (onDeductStock) {
      onDeductStock(deductItem.id, qtyToDeduct, deductProject);
    }
    setDeductItem(null);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem) return;
    const qtyToAdd = Math.max(1, restockQty);
    const newStock = restockItem.currentStock + qtyToAdd;
    const newStatus: MaterialStockItem['status'] = 
      newStock <= restockItem.minimumThreshold ? 'LOW_STOCK' : 'IN_STOCK';

    const updated: MaterialStockItem = {
      ...restockItem,
      currentStock: newStock,
      unitCost: restockRate > 0 ? restockRate : restockItem.unitCost,
      status: newStatus,
      lastRestockedDate: new Date().toISOString().split('T')[0]
    };

    onUpdateStock(updated);
    setRestockItem(null);
  };

  const handleCreateNewStockItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemCode.trim()) return;

    const newItem: MaterialStockItem = {
      id: `stk_${Date.now()}`,
      itemCode: newItemCode.trim(),
      name: newItemName.trim(),
      category: newItemCategory,
      unit: newItemUnit.trim(),
      currentStock: Number(newItemStock) || 0,
      reservedForProjects: 0,
      minimumThreshold: Number(newItemMinThreshold) || 10,
      unitCost: Number(newItemUnitCost) || 0,
      warehouseLocation: newItemLocation.trim() || 'Central Storage Yard',
      lastRestockedDate: new Date().toISOString().split('T')[0],
      status: (Number(newItemStock) || 0) <= (Number(newItemMinThreshold) || 10) ? 'LOW_STOCK' : 'IN_STOCK'
    };

    if (onAddStockItem) {
      onAddStockItem(newItem);
    } else {
      onUpdateStock(newItem);
    }

    setShowNewItemModal(false);
    setNewItemCode('');
    setNewItemName('');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner - Blue & White Professional UI */}
      <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Warehouse & Factory Logistics
            </span>
            <span className="text-xs text-blue-700 font-bold">Real-Time Inventory Ledger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-blue-600" />
            Stocks & Materials Inventory Management
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Live catalog of raw materials, sheet goods, metal pipes, LED drivers, and fasteners. Automatically reserves and deducts materials when site supervisor requests are fulfilled.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewItemModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Inventory Item
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Catalog SKUs</span>
            <Warehouse className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalItemsCount} Types</div>
          <p className="text-[11px] text-slate-400 font-medium">Standardized stock items</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inventory Valuation</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">₹{totalInventoryValuation.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-slate-400 font-medium">At current factory cost</p>
        </div>

        <div className="bg-white border border-amber-200 p-4 rounded-xl shadow-xs space-y-1 bg-amber-50/30">
          <div className="flex justify-between items-center text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800">{lowStockCount} Items</div>
          <p className="text-[11px] text-amber-700/80 font-medium">Near minimum safety reorder limit</p>
        </div>

        <div className="bg-white border border-rose-200 p-4 rounded-xl shadow-xs space-y-1 bg-rose-50/30">
          <div className="flex justify-between items-center text-rose-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Critical / Out of Stock</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-800">{criticalCount} Items</div>
          <p className="text-[11px] text-rose-700/80 font-medium">Requires immediate purchase order</p>
        </div>
      </div>

      {/* Controls Bar: Search & Category Chips */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search materials, item code, rack location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-bold">
            {(['ALL', 'IN_STOCK', 'LOW_STOCK', 'CRITICAL_OUT_OF_STOCK'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st === 'ALL' ? 'All Stock' : st === 'IN_STOCK' ? 'In Stock' : st === 'LOW_STOCK' ? 'Low Stock' : 'Critical Out'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Category:</span>
          {(['ALL', 'ACRYLIC', 'METALS_STEEL', 'LEDS_ELECTRICAL', 'VINYL_PRINTING', 'HARDWARE_FASTENERS', 'WOOD_BOARDS'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                categoryFilter === cat
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Item Code & Material Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-center">Reserved</th>
                <th className="py-3 px-4 text-center">Min Threshold</th>
                <th className="py-3 px-4 text-right">Unit Rate</th>
                <th className="py-3 px-4">Warehouse Location</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No material stock records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((item) => {
                  const isLow = item.currentStock <= item.minimumThreshold;
                  const isCritical = item.currentStock === 0;

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] font-mono text-blue-600 font-bold">{item.itemCode}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {item.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-black text-slate-900 text-sm">
                        {item.currentStock} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-center text-amber-700 font-bold">
                        {item.reservedForProjects} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500">
                        {item.minimumThreshold} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        ₹{item.unitCost.toLocaleString('en-IN')} <span className="text-[10px] text-slate-400 font-normal">/{item.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {item.warehouseLocation}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                            Critical Out
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setDeductItem(item);
                              setDeductQty(Math.min(item.currentStock, 5));
                            }}
                            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1"
                            title="Deduct material for site project"
                          >
                            <MinusCircle className="w-3.5 h-3.5 text-rose-600" /> Deduct
                          </button>
                          <button
                            onClick={() => {
                              setRestockItem(item);
                              setRestockRate(item.unitCost);
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[11px] px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1"
                            title="Restock materials"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-blue-600" /> Restock
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deduction Modal */}
      {deductItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MinusCircle className="w-5 h-5 text-rose-600" /> Deduct Material for Project
              </h3>
              <button onClick={() => setDeductItem(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDeduct} className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl space-y-1 border border-slate-200">
                <div className="font-bold text-slate-900">{deductItem.name}</div>
                <div className="text-[11px] text-slate-500">
                  Current In Stock: <span className="font-bold text-slate-800">{deductItem.currentStock} {deductItem.unit}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deduct Quantity ({deductItem.unit}) *</label>
                <input
                  type="number"
                  min="1"
                  max={deductItem.currentStock}
                  value={deductQty}
                  onChange={(e) => setDeductQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign to Project Group *</label>
                <input
                  type="text"
                  value={deductProject}
                  onChange={(e) => setDeductProject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium"
                  placeholder="e.g. Haldirams Flagship Store - Noida"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deduction Notes / Site Supervisor Name</label>
                <textarea
                  value={deductNotes}
                  onChange={(e) => setDeductNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium"
                  placeholder="e.g. Issued to site supervisor Sagar for facade framework."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeductItem(null)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Confirm Deduction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" /> Restock Material Inventory
              </h3>
              <button onClick={() => setRestockItem(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRestock} className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl space-y-1 border border-slate-200">
                <div className="font-bold text-slate-900">{restockItem.name}</div>
                <div className="text-[11px] text-slate-500">
                  Current In Stock: <span className="font-bold text-slate-800">{restockItem.currentStock} {restockItem.unit}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Add Received Quantity ({restockItem.unit}) *</label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Invoice Unit Purchase Cost (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={restockRate}
                  onChange={(e) => setRestockRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Item Modal */}
      {showNewItemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Add New Material SKU
              </h3>
              <button onClick={() => setShowNewItemModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewStockItem} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Code (SKU) *</label>
                <input
                  type="text"
                  placeholder="e.g. MAT-ACR-003"
                  value={newItemCode}
                  onChange={(e) => setNewItemCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Material Name & Specifications *</label>
                <input
                  type="text"
                  placeholder="e.g. Cast Acrylic Sheet 8mm Black Gloss (8x4 ft)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    <option value="ACRYLIC">Acrylic</option>
                    <option value="METALS_STEEL">Metals & Steel</option>
                    <option value="LEDS_ELECTRICAL">LEDs & Electrical</option>
                    <option value="VINYL_PRINTING">Vinyl & Printing</option>
                    <option value="HARDWARE_FASTENERS">Hardware & Fasteners</option>
                    <option value="WOOD_BOARDS">Wood & Boards</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    placeholder="Sheets, Pipes, Pcs, Rolls"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={newItemMinThreshold}
                    onChange={(e) => setNewItemMinThreshold(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-amber-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    value={newItemUnitCost}
                    onChange={(e) => setNewItemUnitCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Warehouse Bay Location</label>
                <input
                  type="text"
                  placeholder="e.g. Bay A-3, Central Warehouse"
                  value={newItemLocation}
                  onChange={(e) => setNewItemLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewItemModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Save Material Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
