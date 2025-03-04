import React from "react";
import { Button } from "../../components/ui/button";

// Interfaces actualizadas para incluir modifiers y comments
interface Order {
  base: string;
  priceBase: number;
  qty: number;
  status: "Pendiente" | "Hecho";
  modifiers?: {
    added?: { name: string; price: number }[];
    removed?: { name: string; price: number }[];
  };
  comments?: string[];
}

interface Table {
  id: number;
  name: string;
  orders: Order[];
  notes?: string;
  pickupTime?: string;
}

interface MesasTabProps {
  tables: Table[];
  selectedTableForService: Table | null;
  setSelectedTableForService: (table: Table | null) => void;
}

// Se asume que getTableClassesForGeneral es la misma definida globalmente en POSSystem.tsx.
function getTableClassesForGeneral(table: Table) {
  if (table.orders.length > 0) {
    const nameLower = table.name.toLowerCase();
    if (nameLower.includes("delivery")) {
      return { bgClass: "bg-green-400", textClass: "text-black text-xl font-bold" };
    } else if (nameLower.includes("glovo")) {
      return { bgClass: "bg-pink-400", textClass: "text-black text-xl font-bold" };
    } else {
      return { bgClass: "bg-yellow-400", textClass: "text-black text-xl font-bold" };
    }
  }
  const nameLower = table.name.toLowerCase();
  if (nameLower.includes("delivery")) {
    return { bgClass: "bg-green-200", textClass: "text-gray-500 text-lg" };
  } else if (nameLower.includes("glovo")) {
    return { bgClass: "bg-pink-200", textClass: "text-gray-500 text-lg" };
  } else {
    return { bgClass: "bg-yellow-200", textClass: "text-gray-500 text-lg" };
  }
}

const MesasTab: React.FC<MesasTabProps> = ({
  tables,
  selectedTableForService,
  setSelectedTableForService,
}) => {
  // Vista detallada cuando se selecciona una mesa (se mantiene el uso del Card si se desea)
  if (selectedTableForService) {
    const total = selectedTableForService.orders.reduce(
      (acc, order) => acc + order.priceBase,
      0
    );
    const nameLower = selectedTableForService.name.toLowerCase();
    const isDeliveryOrGlovo =
      nameLower.includes("delivery") || nameLower.includes("glovo");
    return (
      <div className="p-2">
        <Button
          className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          onClick={() => setSelectedTableForService(null)}
        >
          Volver a lista
        </Button>
        <div className="bg-yellow-200 border p-2 rounded-md shadow">
          <h2 className="text-xl font-bold mb-2">{selectedTableForService.name}</h2>
          {isDeliveryOrGlovo &&
            (selectedTableForService.notes || selectedTableForService.pickupTime) && (
              <div className="bg-gray-100 p-2 mb-2 rounded space-y-1">
                {selectedTableForService.notes && (
                  <div className="text-lg font-bold">{selectedTableForService.notes}</div>
                )}
                {selectedTableForService.pickupTime && (
                  <div className="text-lg font-bold">{selectedTableForService.pickupTime}</div>
                )}
              </div>
            )}
          <div className="space-y-1">
            {selectedTableForService.orders.map((order, idx) => (
              <div key={idx} className="border p-1 mb-1">
                <div className="text-base font-semibold">
                  {order.base} x{order.qty} - {order.priceBase.toFixed(2)}€
                </div>
                {/* Comprobación segura de modifiers */}
                {order.modifiers && (
                  <div className="mt-1 text-sm">
                    <strong>Ingredientes:</strong>
                    {order.modifiers.added && order.modifiers.added.length > 0 && (
                      <div className="text-blue-500">
                        {order.modifiers.added.map((mod, mIdx) => (
                          <div key={`added-${mIdx}`}>
                            {mod.name.startsWith('+') ? mod.name : `+ ${mod.name}`}
                          </div>
                        ))}
                      </div>
                    )}
                    {order.modifiers.removed && order.modifiers.removed.length > 0 && (
                      <div className="text-red-500">
                        {order.modifiers.removed.map((mod, mIdx) => (
                          <div key={`removed-${mIdx}`}>
                            {mod.name.startsWith('-') ? mod.name : `- ${mod.name}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {order.comments && order.comments.length > 0 && (
                  <div className="mt-1">
                    <strong>Notas:</strong>
                    {order.comments.map((comment, cIdx) => (
                      <div key={`comment-${cIdx}`}>{comment}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-right font-bold text-lg mt-2">Total: {total.toFixed(2)}€</div>
          <div className="flex justify-end gap-2 mt-2">
            <Button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">
              Cobrar
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
              Imprimir
            </Button>
          </div>
        </div>
      </div>
    );
  }
  // Vista general: en la pestaña "Mesas" se muestran solo las mesas ocupadas.
  const occupiedTables = tables.filter((table) => table.orders.length > 0);
  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-4">Mesas Ocupadas</h1>
      {occupiedTables.length === 0 ? (
        <p className="text-gray-500">No hay comandas ocupadas.</p>
      ) : (
        <div className="grid grid-cols-6 gap-2">
          {occupiedTables.map((table) => {
            const { bgClass } = getTableClassesForGeneral(table);
            const total = table.orders.reduce((acc, o) => acc + o.priceBase, 0);
            return (
              <div key={table.id} className={`w-full h-full ${bgClass}`}>
                {/* Se reemplaza el Card por un div para eliminar la cuadrícula blanca */}
                <div
                  className="cursor-pointer hover:shadow-lg transform transition"
                  onClick={() => setSelectedTableForService(table)}
                >
                  <div className="p-2">
                    <h2 className="text-sm font-semibold">{table.name}</h2>
                    <p className="text-lg font-bold">Total: {total.toFixed(2)}€</p>
                    {(table.notes || table.pickupTime) && (
                      <div className="mt-1 space-y-1">
                        {table.notes && <p className="text-lg font-bold">{table.notes}</p>}
                        {table.pickupTime && <p className="text-lg font-bold">{table.pickupTime}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MesasTab;
