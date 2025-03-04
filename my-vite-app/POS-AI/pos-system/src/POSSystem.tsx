import React, { useState, useRef, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "./components/ui/dialog";
import { categorias } from "./modules/categorias/categories";

/* ============================================================
   TIPOS E INTERFACES
   ============================================================ */
interface Order {
  base: string;
  priceBase: number;
  qty: number;
  modifiers?: {
    added: { name: string; price: number }[];
    removed: { name: string; price: number }[];
  };
  comments?: string[];
  isSecond?: boolean;
  done?: boolean;
  doneAt?: number; // Marca de tiempo cuando se marca el pedido como "done"
  served?: boolean; // Indica si ya se ha marcado el pedido como servido en Servicio
  marchado?: boolean; // Solo para productos marchables: se marca en Cocina
}

interface Table {
  id: number;
  name: string;
  orders: Order[];
  notes?: string;
  pickupTime?: string;
  pedirSegundos?: boolean;
  takenAt?: number; // Marca de tiempo del primer pedido en la mesa
}

interface Sale {
  id: number;
  tableName: string;
  orders: Order[];
  total: number;
  date: string;
}

/* ----------------------------------------------------------------
   FUNCIONES AUXILIARES
------------------------------------------------------------------ */
function getAllProductsFromCategory(catData: any): string[] {
  let result: string[] = [];
  for (const key in catData) {
    const value = catData[key];
    if (typeof value === "number") {
      result.push(key.toLowerCase());
    } else if (typeof value === "object" && value !== null) {
      if ("price" in value) {
        result.push(key.toLowerCase());
      } else {
        result = result.concat(getAllProductsFromCategory(value));
      }
    }
  }
  return result;
}

function getTableClassesForGeneral(table: Table) {
  if (table.orders.length > 0) {
    const nameLower = table.name.toLowerCase();
    if (nameLower.includes("delivery"))
      return { bgClass: "bg-green-400", textClass: "text-black text-xl font-bold" };
    else if (nameLower.includes("glovo"))
      return { bgClass: "bg-pink-400", textClass: "text-black text-xl font-bold" };
    else return { bgClass: "bg-yellow-400", textClass: "text-black text-xl font-bold" };
  }
  const nameLower = table.name.toLowerCase();
  if (nameLower.includes("delivery"))
    return { bgClass: "bg-green-200", textClass: "text-gray-500 text-lg" };
  else if (nameLower.includes("glovo"))
    return { bgClass: "bg-pink-200", textClass: "text-gray-500 text-lg" };
  else return { bgClass: "bg-yellow-200", textClass: "text-gray-500 text-lg" };
}

// Función auxiliar para mostrar el tiempo transcurrido
function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) {
    return `Hace ${diffSeconds} segundos`;
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} minutos`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Hace ${diffHours} horas`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} días`;
}

/* ============================================================
   COMPONENTE: PickupTimeInput
   (Input de tipo "time" que hace blur al cambiar los minutos)
   ============================================================ */
function PickupTimeInput({
  currentTime,
  onTimeChange,
}: {
  currentTime: string;
  onTimeChange: (newTime: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const pickupTimePrev = useRef(currentTime);
  return (
    <input
      type="time"
      className="border rounded p-1 text-sm w-full"
      value={currentTime}
      onChange={(e) => {
        const newTime = e.target.value;
        onTimeChange(newTime, e);
        if (
          newTime.length === 5 &&
          pickupTimePrev.current &&
          newTime.slice(3) !== pickupTimePrev.current.slice(3)
        ) {
          e.currentTarget.blur();
        }
        pickupTimePrev.current = newTime;
      }}
    />
  );
}

/* ============================================================
   COMPONENTE: COCINA SCREEN
   (Vista detallada de las comandas en la pestaña Cocina)
   ============================================================ */
function CocinaScreen({
  tables,
  setTables,
}: {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
}) {
  const bebidasCategory = categorias["bebidas"] || categorias["Bebidas 🥛"] || {};
  const bebidaProducts = new Set(getAllProductsFromCategory(bebidasCategory));

  const entrantes = categorias["Entrantes 🥙"]
    ? getAllProductsFromCategory(categorias["Entrantes 🥙"])
    : [];
  const pastas = categorias["Pastas 🍜"]
    ? getAllProductsFromCategory(categorias["Pastas 🍜"])
    : [];
  const carnes = categorias["Carnes 🥩"]
    ? getAllProductsFromCategory(categorias["Carnes 🥩"])
    : [];
  const pescados = categorias["Pescados 🐟"]
    ? getAllProductsFromCategory(categorias["Pescados 🐟"])
    : [];
  const marchableProducts = new Set([...entrantes, ...pastas, ...carnes, ...pescados]);

  // Se muestran todos los pedidos (excepto servidos y bebidas)
  const filterOrders = (orders: Order[], table: Table): Order[] =>
    orders.filter((order) => {
      if (order.served) return false;
      const isBebida = bebidaProducts.has(order.base.toLowerCase());
      if (isBebida) return false;
      return true;
    });

  const mesasConPedidos = tables.filter((table) => filterOrders(table.orders, table).length > 0);
  const mesasOrdenadas = mesasConPedidos.slice().sort(
    (a, b) => (a.takenAt ?? 0) - (b.takenAt ?? 0)
  );

  function handleMarkAsDone(tableId: number, orderIndex: number) {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? {
              ...table,
              orders: table.orders.map((order, idx) =>
                idx === orderIndex
                  ? {
                      ...order,
                      done: !order.done,
                      doneAt: !order.done ? (order.doneAt || Date.now()) : undefined,
                    }
                  : order
              ),
            }
          : table
      )
    );
  }

  function handleMarchar(tableId: number, orderIndex: number) {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? {
              ...table,
              orders: table.orders.map((order, idx) =>
                idx === orderIndex ? { ...order, marchado: !order.marchado } : order
              ),
            }
          : table
      )
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pedidos de Cocina</h1>
      <div className="flex flex-row-reverse space-x-4 overflow-x-auto">
        {mesasOrdenadas.map((table) => {
          const allowedOrders = filterOrders(table.orders, table);
          return (
            <div key={table.id} className="min-w-[250px] bg-yellow-100 p-4 rounded shadow relative">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">{table.name}</h2>
              </div>
              {table.takenAt && (
                <div className="mb-2">
                  <span className="text-sm text-gray-600">
                    {getTimeAgo(table.takenAt)}
                  </span>
                </div>
              )}
              {(table.name.toLowerCase().includes("delivery") ||
                table.name.toLowerCase().includes("glovo")) && (
                <div className="mb-2">
                  {table.notes && (
                    <div className="text-lg">
                      <strong>Cliente:</strong> {table.notes}
                    </div>
                  )}
                  {table.pickupTime && (
                    <div className="text-lg">
                      <strong>⏰:</strong> {table.pickupTime}
                    </div>
                  )}
                </div>
              )}
              <ul className="space-y-2">
                {allowedOrders.map((order, idx) => {
                  const isSpecial = order.isSecond && !table.pedirSegundos;
                  return (
                    <li key={idx} className="border-b pb-1">
                      <div className="flex items-center justify-between">
                        <div className={isSpecial ? "text-gray-400" : (order.done || order.marchado ? "line-through" : "")}>
                          {order.base}
                        </div>
                        {!isSpecial && (
                          <>
                            {marchableProducts.has(order.base.toLowerCase()) ? (
                              <Button
                                className={`${
                                  order.marchado ? "bg-red-500 hover:bg-red-500" : "bg-blue-500 hover:bg-blue-500"
                                } self-start`}
                                onClick={() =>
                                  handleMarchar(
                                    table.id,
                                    table.orders.findIndex((o) => o === order)
                                  )
                                }
                              >
                                {order.marchado ? "Marchado" : "Marchar"}
                              </Button>
                            ) : (
                              <Button
                                className={`${
                                  order.done ? "bg-red-500 hover:bg-red-500" : "bg-green-500 hover:bg-green-500"
                                } self-start`}
                                onClick={() =>
                                  handleMarkAsDone(
                                    table.id,
                                    table.orders.findIndex((o) => o === order)
                                  )
                                }
                              >
                                Hecho
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                      {order.modifiers &&
                        ((order.modifiers.added && order.modifiers.added.length > 0) ||
                          (order.modifiers.removed && order.modifiers.removed.length > 0)) && (
                          <div className="ml-4 text-sm">
                            <strong>Ingredientes:</strong>
                            {order.modifiers.added && order.modifiers.added.length > 0 && (
                              <div>
                                {order.modifiers.added.map((mod, mIdx) => (
                                  <div key={`added-${mIdx}`} className={mod.name === "sin gluten" ? "text-green-500" : "text-blue-500"}>
                                    {mod.name} {mod.price ? `(${mod.price.toFixed(2)}€)` : ""}
                                  </div>
                                ))}
                              </div>
                            )}
                            {order.modifiers.removed && order.modifiers.removed.length > 0 && (
                              <div className="text-red-500">
                                {order.modifiers.removed.map((mod, mIdx) => (
                                  <div key={`removed-${mIdx}`}>{mod.name}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTE: COCINA2 SCREEN
   (Vista de Cocina 2, similar a Cocina, pero con filtrado distinto)
   ============================================================ */
function Cocina2Screen({
  tables,
  setTables,
}: {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
}) {
  const bebidasCategory = categorias["bebidas"] || categorias["Bebidas 🥛"] || {};
  const pizzasCategory = categorias["pizzas"] || categorias["Pizzas 🍕"] || {};
  const bebidaProducts = new Set(getAllProductsFromCategory(bebidasCategory));
  const pizzaProducts = new Set(getAllProductsFromCategory(pizzasCategory));

  const entrantes = categorias["Entrantes 🥙"]
    ? getAllProductsFromCategory(categorias["Entrantes 🥙"])
    : [];
  const pastas = categorias["Pastas 🍜"]
    ? getAllProductsFromCategory(categorias["Pastas 🍜"])
    : [];
  const carnes = categorias["Carnes 🥩"]
    ? getAllProductsFromCategory(categorias["Carnes 🥩"])
    : [];
  const pescados = categorias["Pescados 🐟"]
    ? getAllProductsFromCategory(categorias["Pescados 🐟"])
    : [];
  const marchableProducts = new Set([...entrantes, ...pastas, ...carnes, ...pescados]);

  // Filtramos para no incluir bebidas ni pizzas
  const filterOrders = (orders: Order[], table: Table): Order[] =>
    orders.filter((order) => {
      if (order.served) return false;
      const isBebida = bebidaProducts.has(order.base.toLowerCase());
      const isPizza = pizzaProducts.has(order.base.toLowerCase());
      if (isBebida || isPizza) return false;
      return true;
    });

  const mesasConPedidos = tables.filter((table) => filterOrders(table.orders, table).length > 0);
  const mesasOrdenadas = mesasConPedidos.slice().sort(
    (a, b) => (a.takenAt ?? 0) - (b.takenAt ?? 0)
  );

  function handleMarkAsDone(tableId: number, orderIndex: number) {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? {
              ...table,
              orders: table.orders.map((order, idx) =>
                idx === orderIndex
                  ? {
                      ...order,
                      done: !order.done,
                      doneAt: !order.done ? (order.doneAt || Date.now()) : undefined,
                    }
                  : order
              ),
            }
          : table
      )
    );
  }

  function handleMarchar(tableId: number, orderIndex: number) {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? {
              ...table,
              orders: table.orders.map((order, idx) =>
                idx === orderIndex ? { ...order, marchado: !order.marchado } : order
              ),
            }
          : table
      )
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pedidos de Cocina 2</h1>
      <div className="flex flex-row-reverse space-x-4 overflow-x-auto">
        {mesasOrdenadas.map((table) => {
          const allowedOrders = filterOrders(table.orders, table);
          return (
            <div key={table.id} className="min-w-[250px] bg-yellow-100 p-4 rounded shadow relative">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">{table.name}</h2>
              </div>
              {table.takenAt && (
                <div className="mb-2">
                  <span className="text-sm text-gray-600">
                    {getTimeAgo(table.takenAt)}
                  </span>
                </div>
              )}
              {(table.name.toLowerCase().includes("delivery") ||
                table.name.toLowerCase().includes("glovo")) && (
                <div className="mb-2">
                  {table.notes && (
                    <div className="text-lg">
                      <strong>Cliente:</strong> {table.notes}
                    </div>
                  )}
                  {table.pickupTime && (
                    <div className="text-lg">
                      <strong>Hora de recogida:</strong> {table.pickupTime}
                    </div>
                  )}
                </div>
              )}
              <ul className="space-y-2">
                {allowedOrders.map((order, idx) => {
                  const isSpecial = (!table.pedirSegundos && order.isSecond) || (marchableProducts.has(order.base.toLowerCase()) && !order.marchado);
                  return (
                    <li key={idx} className="border-b pb-1">
                      <div className="flex items-center justify-between">
                        <div className={isSpecial ? "text-gray-400" : (order.done ? "line-through" : "")}>
                          {order.base}
                        </div>
                        {!isSpecial && (
                          <Button
                            className={`${
                              order.done ? "bg-red-500 hover:bg-red-500" : "bg-green-500 hover:bg-green-500"
                            } self-start`}
                            onClick={() =>
                              handleMarkAsDone(table.id, table.orders.findIndex((o) => o === order))
                            }
                          >
                            Hecho
                          </Button>
                        )}
                      </div>
                      {order.modifiers &&
                        ((order.modifiers.added && order.modifiers.added.length > 0) ||
                          (order.modifiers.removed && order.modifiers.removed.length > 0)) && (
                          <div className="ml-4 text-sm">
                            <strong>Ingredientes:</strong>
                            {order.modifiers.added && order.modifiers.added.length > 0 && (
                              <div>
                                {order.modifiers.added.map((mod, mIdx) => (
                                  <div key={`added-${mIdx}`} className={mod.name === "sin gluten" ? "text-green-500" : "text-blue-500"}>
                                    {mod.name} {mod.price ? `(${mod.price.toFixed(2)}€)` : ""}
                                  </div>
                                ))}
                              </div>
                            )}
                            {order.modifiers.removed && order.modifiers.removed.length > 0 && (
                              <div className="text-red-500">
                                {order.modifiers.removed.map((mod, mIdx) => (
                                  <div key={`removed-${mIdx}`}>{mod.name}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTE: SERVICIO SCREEN
   (Visualización de los pedidos servidos: se muestran solo los pedidos marcados como "hecho")
   ============================================================ */
function ServicioScreen({
  tables,
  setTables,
}: {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
}) {
  const bebidasCategory = categorias["bebidas"] || categorias["Bebidas 🥛"] || {};
  const bebidaProducts = new Set(getAllProductsFromCategory(bebidasCategory));

  const doneOrders = tables.flatMap((table) =>
    table.orders
      .filter(
        (order) =>
          order.done &&
          !order.served &&
          !bebidaProducts.has(order.base.toLowerCase())
      )
      .map((order) => ({
        tableId: table.id,
        tableName: table.name,
        order,
        orderIndex: table.orders.indexOf(order),
      }))
  );
  const sortedDoneOrders = doneOrders.slice().sort(
    (a, b) => (a.order.doneAt ?? 0) - (b.order.doneAt ?? 0)
  );

  const handleMarkServed = (tableId: number, orderIndex: number) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? {
              ...table,
              orders: table.orders.map((order, idx) =>
                idx === orderIndex ? { ...order, served: true } : order
              ),
            }
          : table
      )
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pedidos Servidos</h1>
      {sortedDoneOrders.length === 0 ? (
        <p className="text-gray-500">No hay pedidos servidos.</p>
      ) : (
        <div className="space-y-4">
          {sortedDoneOrders.map((item, idx) => (
            <div key={idx} className="border p-4 rounded shadow-md w-full">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="w-full md:w-1/3 text-left mb-2 md:mb-0">
                  <span className="text-lg font-semibold">{item.order.base}</span>
                </div>
                <div className="w-full md:w-1/3 text-center mb-2 md:mb-0">
                  <span className="text-lg font-semibold">{item.tableName}</span>
                </div>
                <div className="w-full md:w-1/3 text-right">
                  <Button
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    onClick={() => handleMarkServed(item.tableId, item.orderIndex)}
                  >
                    Servido
                  </Button>
                </div>
              </div>
              {item.order.modifiers &&
                ((item.order.modifiers.added && item.order.modifiers.added.length > 0) ||
                 (item.order.modifiers.removed && item.order.modifiers.removed.length > 0)) && (
                <div className="mt-2 text-sm">
                  <strong>Ingredientes:</strong>
                  {item.order.modifiers.added && item.order.modifiers.added.length > 0 && (
                    <div>
                      {item.order.modifiers.added.map((mod, mIdx) => (
                        <div key={`added-${mIdx}`} className={mod.name === "sin gluten" ? "text-green-500" : "text-blue-500"}>
                          {mod.name} ({mod.price.toFixed(2)}€)
                        </div>
                      ))}
                    </div>
                  )}
                  {item.order.modifiers.removed && item.order.modifiers.removed.length > 0 && (
                    <div className="text-red-500">
                      {item.order.modifiers.removed.map((mod, mIdx) => (
                        <div key={`removed-${mIdx}`}> {mod.name}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   COMPONENTE: REPORTES SCREEN
   (Visualización de los reportes de ventas)
   ============================================================ */
function ReportesScreen({ sales }: { sales: Sale[] }) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Reportes</h1>
      {sales.length === 0 ? (
        <p className="text-gray-500">No hay reportes disponibles.</p>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <div key={sale.id} className="border p-4 rounded">
              <h2 className="text-xl font-bold">{sale.tableName}</h2>
              <p>Total: {sale.total.toFixed(2)}€</p>
              <p>Fecha: {new Date(sale.date).toLocaleString("es-ES")}</p>
              <ul className="mt-2">
                {sale.orders.map((order, idx) => (
                  <li key={idx}>
                    {order.base} - {order.priceBase.toFixed(2)}€
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   COMPONENTE: MESAS TAB COMPONENT
   (Listado de mesas y vista de detalle al seleccionar una comanda)
   ============================================================ */
function MesasTabComponent({
  tables,
  setTables,
  selectedTableForService,
  setSelectedTableForService,
  onCobrar,
}: {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  selectedTableForService: Table | null;
  setSelectedTableForService: React.Dispatch<React.SetStateAction<Table | null>>;
  onCobrar: (table: Table) => void;
}) {
  function getTableClassesForLocal(table: Table) {
    if (table.orders.length > 0) {
      const nameLower = table.name.toLowerCase();
      if (nameLower.includes("delivery"))
        return { bgClass: "bg-green-400", textClass: "text-black text-xl font-bold" };
      else if (nameLower.includes("glovo"))
        return { bgClass: "bg-pink-400", textClass: "text-black text-xl font-bold" };
      else return { bgClass: "bg-yellow-400", textClass: "text-black text-xl font-bold" };
    }
    const nameLower = table.name.toLowerCase();
    if (nameLower.includes("delivery"))
      return { bgClass: "bg-green-200", textClass: "text-gray-500 text-lg" };
    else if (nameLower.includes("glovo"))
      return { bgClass: "bg-pink-200", textClass: "text-gray-500 text-lg" };
    else return { bgClass: "bg-yellow-200", textClass: "text-gray-500 text-lg" };
  }

  function handleImprimir(table: Table) {
    window.print();
  }

  if (selectedTableForService) {
    const table = selectedTableForService;
    const total = table.orders.reduce((acc, order) => acc + order.priceBase, 0);
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Detalle de {table.name}</h2>
          <Button onClick={() => onCobrar(table)} className="bg-purple-500 text-white px-2 py-1 rounded">
            Cobrar
          </Button>
        </div>
        <ul className="space-y-2">
          {table.orders.map((order, idx) => (
            <li key={idx} className="border p-2 rounded">
              <div className="flex justify-between items-center">
                <span className="font-bold">{order.base}</span>
                <span>{order.priceBase.toFixed(2)}€</span>
              </div>
              {order.modifiers &&
                ((order.modifiers.added && order.modifiers.added.length > 0) ||
                 (order.modifiers.removed && order.modifiers.removed.length > 0)) && (
                <div className="mt-2 text-sm">
                  <strong>Ingredientes:</strong>
                  {order.modifiers.added && order.modifiers.added.length > 0 && (
                    <div>
                      {order.modifiers.added.map((mod, mIdx) => (
                        <div key={`added-${mIdx}`} className={mod.name === "sin gluten" ? "text-green-500" : "text-blue-500"}>
                          {mod.name} {mod.price ? `(${mod.price.toFixed(2)}€)` : ""}
                        </div>
                      ))}
                    </div>
                  )}
                  {order.modifiers.removed && order.modifiers.removed.length > 0 && (
                    <div className="text-red-500">
                      {order.modifiers.removed.map((mod, mIdx) => (
                        <div key={`removed-${mIdx}`}> {mod.name}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-lg font-bold">Total: {total.toFixed(2)}€</div>
          <div className="flex gap-2">
            <Button onClick={() => handleImprimir(table)} className="bg-blue-500 text-white px-2 py-1 rounded">
              Imprimir
            </Button>
            <Button onClick={() => setSelectedTableForService(null)}>Volver</Button>
          </div>
        </div>
      </div>
    );
  }

  const occupiedTables = tables.filter((table) => table.orders.length > 0);
  return (
    <div className="p-2">
      {occupiedTables.length > 0 ? (
        <div className="grid grid-cols-6 gap-2">
          {occupiedTables.map((table) => {
            const { bgClass, textClass } = getTableClassesForGeneral(table);
            const total = table.orders.reduce((acc, o) => acc + o.priceBase, 0);
            return (
              <div key={table.id} className={`w-full h-full ${bgClass}`}>
                <Card
                  className="cursor-pointer hover:shadow-lg transform transition bg-transparent h-full relative"
                  style={{ backgroundColor: "transparent" }}
                  onClick={() => setSelectedTableForService(table)}
                >
                  {table.orders.some((order) => order.isSecond && !table.pedirSegundos) && (
                    <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full"></div>
                  )}
                  <CardContent className="p-2 bg-transparent h-full" style={{ backgroundColor: "transparent" }}>
                    <h2 className={textClass}>{table.name}</h2>
                    {table.orders.length > 0 ? (
                      <p className="text-lg font-bold">Total: {total.toFixed(2)}€</p>
                    ) : (
                      <p className="text-lg font-bold">Libre</p>
                    )}
                    {(table.notes || table.pickupTime) && (
                      <div className="mt-1 space-y-1">
                        {table.notes && <p className="text-lg font-bold">{table.notes}</p>}
                        {table.pickupTime && <p className="text-lg font-bold">{table.pickupTime}</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No hay mesas.</p>
      )}
    </div>
  );
}

/* ============================================================
   COMPONENTE: POSSystem
   ============================================================ */
export default function POSSystem() {
  const [activeTab, setActiveTab] = useState("mesas");
  const [tables, setTables] = useState<Table[]>([
    { id: 1, name: "Mesa 1", orders: [] },
    { id: 2, name: "Mesa 2", orders: [] },
    { id: 3, name: "Mesa 3", orders: [] },
    { id: 4, name: "Mesa 4", orders: [] },
    { id: 5, name: "Mesa 5", orders: [] },
    { id: 6, name: "Mesa 6", orders: [] },
    { id: 7, name: "Mesa 7", orders: [] },
    { id: 8, name: "Mesa 8", orders: [] },
    { id: 9, name: "Mesa T1", orders: [] },
    { id: 10, name: "Mesa T2", orders: [] },
    { id: 11, name: "Mesa T3", orders: [] },
    { id: 12, name: "Mesa T4", orders: [] },
    { id: 13, name: "Mesa T5", orders: [] },
    { id: 14, name: "Mesa T6", orders: [] },
    { id: 15, name: "Mesa T7", orders: [] },
    { id: 16, name: "Mesa T8", orders: [] },
    { id: 17, name: "Mesa TB1", orders: [] },
    { id: 18, name: "Mesa TB2", orders: [] },
    { id: 19, name: "GLOVO 1", orders: [] },
    { id: 20, name: "GLOVO 2", orders: [] },
    { id: 21, name: "GLOVO 3", orders: [] },
    { id: 22, name: "GLOVO 4", orders: [] },
    { id: 23, name: "GLOVO 5", orders: [] },
    { id: 24, name: "GLOVO 6", orders: [] },
    { id: 25, name: "delivery 1", orders: [] },
    { id: 26, name: "delivery 2", orders: [] },
    { id: 27, name: "delivery 3", orders: [] },
    { id: 28, name: "delivery 4", orders: [] },
    { id: 29, name: "delivery 5", orders: [] },
    { id: 30, name: "delivery 6", orders: [] },
    { id: 31, name: "delivery 7", orders: [] },
    { id: 32, name: "delivery 8", orders: [] },
  ]);
  const [selectedTableForService, setSelectedTableForService] = useState<Table | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [modifierData, setModifierData] = useState<Record<string, number> | null>(null);
  const [modifierMode, setModifierMode] = useState<"add" | "remove" | null>(null);
  const [showIngredientScreen, setShowIngredientScreen] = useState<boolean>(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [modifyIndex, setModifyIndex] = useState<number | null>(null);
  const [openModifiers, setOpenModifiers] = useState<{ [productName: string]: "add" | "remove" | null; }>({});
  const [commentBoxIndex, setCommentBoxIndex] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");

  const [showCobrarDialog, setShowCobrarDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta" | null>(null);
  const [showEntregadoDialog, setShowEntregadoDialog] = useState(false);
  const [deliveredAmount, setDeliveredAmount] = useState("");
  const [showCambioDialog, setShowCambioDialog] = useState(false);
  const [changeAmount, setChangeAmount] = useState(0);
  const [currentCobrarTable, setCurrentCobrarTable] = useState<Table | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);

  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [timeDialogOption, setTimeDialogOption] = useState<"manual" | "prep" | null>(null);
  const [manualTime, setManualTime] = useState("");
  const prepOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

  // Mapa de flags para evitar reproducir el sonido más de una vez por mesa
  const soundPlayedMap = useRef<Record<number, boolean>>({});
  const soundTimeoutMap = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // Efecto que revisa todas las mesas cuando activeTab es camareros, cocina o cocina2
  useEffect(() => {
    if (["camareros", "cocina", "cocina2"].includes(activeTab)) {
      tables.forEach((table) => {
        if (table.orders.length > 0) {
          if (!soundPlayedMap.current[table.id] && !soundTimeoutMap.current[table.id]) {
            soundTimeoutMap.current[table.id] = setTimeout(() => {
              const audio = new Audio("/alert.mp3");
              audio.play();
              soundPlayedMap.current[table.id] = true;
              delete soundTimeoutMap.current[table.id];
            }, 30000);
          }
        } else {
          // Si la mesa no tiene pedidos, reseteamos el flag y cancelamos timer si existe
          if (soundTimeoutMap.current[table.id]) {
            clearTimeout(soundTimeoutMap.current[table.id]);
            delete soundTimeoutMap.current[table.id];
          }
          soundPlayedMap.current[table.id] = false;
        }
      });
    }
  }, [activeTab, tables]);

  useEffect(() => {
    setSelectedTableForService(null);
    resetSelection();
  }, [activeTab]);

  function resetSelection() {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setModifierData(null);
    setModifierMode(null);
    setOpenModifiers({});
    setCurrentOrder(null);
    setModifyIndex(null);
  }

  function handleServido(tableId: number, orderIndex: number) {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? { ...table, orders: table.orders.filter((_, idx) => idx !== orderIndex) }
          : table
      )
    );
    if (selectedTableForService && selectedTableForService.id === tableId) {
      const updatedTable = { ...selectedTableForService };
      updatedTable.orders = updatedTable.orders.filter((_, idx) => idx !== orderIndex);
      setSelectedTableForService(updatedTable);
    }
  }

  function handleDeleteOrder(tableId: number, orderIndex: number) {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? (() => {
              const updatedOrders = [...table.orders];
              updatedOrders.splice(orderIndex, 1);
              return { ...table, orders: updatedOrders };
            })()
          : table
      )
    );
    if (selectedTableForService && selectedTableForService.id === tableId) {
      const updatedTable = { ...selectedTableForService };
      updatedTable.orders.splice(orderIndex, 1);
      setSelectedTableForService(updatedTable);
    }
  }

  function handleModifyOrder(tableId: number, orderIndex: number) {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;
    const orderToModify = table.orders[orderIndex];
    if (!orderToModify) return;
    setSelectedTableForService(table);
    setCurrentOrder(orderToModify);
    setModifyIndex(orderIndex);
    setShowIngredientScreen(true);
  }

  function handleToggleSecond(tableId: number, orderIndex: number) {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;
    const order = table.orders[orderIndex];
    if (!order) return;
    const updatedOrder: Order = { ...order, isSecond: !order.isSecond };
    setTables((prev) =>
      prev.map((tb) =>
        tb.id === tableId
          ? { ...tb, orders: tb.orders.map((o, idx) => (idx === orderIndex ? updatedOrder : o)) }
          : tb
      )
    );
    if (selectedTableForService && selectedTableForService.id === tableId) {
      const updatedTable = { ...selectedTableForService };
      updatedTable.orders = updatedTable.orders.map((o, idx) =>
        idx === orderIndex ? updatedOrder : o
      );
      setSelectedTableForService(updatedTable);
    }
  }

  function handleAddOrder(productName: string, price: number) {
    if (!selectedTableForService) return;
    const newOrder: Order = {
      base: productName,
      priceBase: price,
      qty: 1,
      modifiers: { added: [], removed: [] },
    };
    if (modifyIndex !== null) {
      updateOrderAtIndex(newOrder, modifyIndex);
      setModifyIndex(null);
      setCurrentOrder(newOrder);
    } else {
      addOrderToCurrentTable(newOrder);
      setCurrentOrder(newOrder);
    }
  }

  function addOrderToCurrentTable(newOrder: Order) {
    setTables((prev) =>
      prev.map((table) =>
        table.id === selectedTableForService?.id
          ? {
              ...table,
              orders: [...table.orders, newOrder],
              takenAt: table.orders.length === 0 ? Date.now() : table.takenAt,
            }
          : table
      )
    );
    if (selectedTableForService) {
      const updatedTable = { ...selectedTableForService };
      if (updatedTable.orders.length === 0) {
        updatedTable.takenAt = Date.now();
      }
      updatedTable.orders = [...updatedTable.orders, newOrder];
      setSelectedTableForService(updatedTable);
    }
  }

  function updateOrderInTable(updatedOrder: Order, orderIndex: number) {
    setTables((prev) =>
      prev.map((table) =>
        table.id === selectedTableForService?.id
          ? { ...table, orders: table.orders.map((o, idx) => (idx === orderIndex ? updatedOrder : o)) }
          : table
      )
    );
    if (selectedTableForService) {
      const updatedTable = { ...selectedTableForService };
      updatedTable.orders = updatedTable.orders.map((o, idx) => (idx === orderIndex ? updatedOrder : o));
      setSelectedTableForService(updatedTable);
    }
  }

  function updateOrderAtIndex(newOrder: Order, index: number) {
    setTables((prev) =>
      prev.map((table) =>
        table.id === selectedTableForService?.id
          ? { ...table, orders: table.orders.map((o, idx) => (idx === index ? newOrder : o)) }
          : table
      )
    );
    if (selectedTableForService) {
      const updatedTable = { ...selectedTableForService };
      updatedTable.orders = updatedTable.orders.map((o, idx) => (idx === index ? newOrder : o));
      setSelectedTableForService(updatedTable);
    }
  }

  function handleSelectModifier(modName: string, modPrice: number, type: "add" | "remove") {
    if (!currentOrder || !selectedTableForService) return;
    const updatedOrder: Order = { ...currentOrder };
    if (!updatedOrder.modifiers) {
      updatedOrder.modifiers = { added: [], removed: [] };
    }
    if (type === "add") {
      updatedOrder.modifiers.added.push({ name: modName, price: modPrice });
      updatedOrder.priceBase += modPrice;
    } else {
      updatedOrder.modifiers.removed.push({ name: modName, price: modPrice });
    }
    const orderIndex = selectedTableForService.orders.findIndex((o) => o === currentOrder);
    if (orderIndex !== -1) {
      updateOrderInTable(updatedOrder, orderIndex);
      setCurrentOrder(updatedOrder);
    }
  }

  function renderProductButton(productName: string, productValue: any) {
    const price = typeof productValue === "number" ? productValue : productValue.price;
    if (selectedCategory && selectedCategory.toLowerCase() === "pizzas 🍕") {
      return (
        <li key={productName} className="flex items-center">
          <Button onClick={() => handleAddOrder(productName, price)} className="w-full text-left">
            {productName} - {price}€
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setModifierData(productValue["+" as keyof typeof productValue]);
              setModifierMode("add");
            }}
            className="ml-2 bg-blue-500 hover:bg-blue-500 text-white px-1 py-0.5 rounded"
          >
            +
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setModifierData(productValue["-" as keyof typeof productValue]);
              setModifierMode("remove");
            }}
            className="ml-2 bg-red-500 hover:bg-red-500 text-white px-1 py-0.5 rounded"
          >
            -
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleSelectModifier("sin gluten", 3, "add");
            }}
            className="ml-2 bg-green-500 hover:bg-green-500 text-white px-1 py-0.5 rounded"
          >
            sin gluten
          </Button>
        </li>
      );
    }
    return (
      <li key={productName}>
        <Button onClick={() => handleAddOrder(productName, price)} className="w-full text-left">
          {productName} - {price}€
        </Button>
      </li>
    );
  }

  function renderCamarerosView() {
    if (selectedTableForService) {
      const currentTable = selectedTableForService;
      const totalVenta = currentTable.orders.reduce((acc, o) => acc + o.priceBase, 0);
      const nameLower = currentTable.name.toLowerCase();
      const isDeliveryOrGlovo = nameLower.includes("delivery") || nameLower.includes("glovo");
      return (
        <div className="space-y-4 p-4 border rounded-md shadow">
          <div className="flex justify-between items-center">
            <h2 className="text-black text-xl font-bold">{currentTable.name}</h2>
            <Button className="bg-green-500 text-white px-4 py-2 rounded-md" onClick={() => setSelectedTableForService(null)}>
              Ver comandas
            </Button>
          </div>
          {currentTable.takenAt && (
            <div className="mt-2">
              <span className="text-sm text-gray-600">
                {getTimeAgo(currentTable.takenAt)}
              </span>
            </div>
          )}
          {isDeliveryOrGlovo && (
            <div className="space-y-2 bg-gray-100 p-2 rounded">
              <div>
                <label className="block font-semibold mb-1 text-sm">Cliente / Número pedido:</label>
                <textarea
                  className="w-full border rounded p-1 text-sm"
                  rows={2}
                  value={currentTable.notes || ""}
                  onChange={(e) => {
                    const newNotes = e.target.value;
                    setTables((prev) =>
                      prev.map((tb) => (tb.id === currentTable.id ? { ...tb, notes: newNotes } : tb))
                    );
                    setSelectedTableForService((prev) =>
                      prev && prev.id === currentTable.id ? { ...prev, notes: newNotes } : prev
                    );
                  }}
                  placeholder="Nombre del cliente, comentarios, etc."
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="block font-semibold text-sm">Hora de recogida:</label>
                <Button onClick={() => setShowTimeDialog(true)} className="bg-blue-400 text-black px-2 py-1 rounded">
                  Tiempo ⏰
                </Button>
                {currentTable.pickupTime && (
                  <span className="text-lg font-bold">{currentTable.pickupTime}</span>
                )}
              </div>
            </div>
          )}
          {currentTable.orders.length > 0 ? (
            <ul className="mt-2 border-t pt-2 space-y-2">
              {currentTable.orders.map((order, index) => {
                const rowBg = order.isSecond ? "bg-orange-200" : "";
                return (
                  <li key={index} className={`border-b pb-2 w-full ${rowBg}`}>
                    {order.isSecond && (
                      <div className="text-center text-xs font-bold text-gray-700">segundos</div>
                    )}
                    <div className="flex justify-end items-center py-0.1 w-96">
                      <div className="flex-5 text-left cursor-pointer w-48 h-8 p-0.1" onClick={() => handleToggleSecond(currentTable.id, index)}>
                        {order.base}
                      </div>
                      <div className="flex space-x-0.5 ml-auto">
                        <Button
                          className="bg-blue-500 text-white px-0.75 py-0.25 text-xs rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleModifyOrder(currentTable.id, index);
                          }}
                        >
                          edit
                        </Button>
                        <Button
                          className="bg-orange-400 text-white px-2 py-1 text-xs rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCommentBoxIndex(index);
                          }}
                        >
                          nota
                        </Button>
                        <Button
                          className="bg-red-500 text-white px-2 py-1 text-xs rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(currentTable.id, index);
                          }}
                        >
                          X
                        </Button>
                      </div>
                    </div>
                    {order.modifiers && (
                      <div className="ml-4 text-sm space-y-1">
                        {(order.modifiers.added.length > 0 || order.modifiers.removed.length > 0) && (
                          <div>
                            <strong>Ingredientes:</strong>
                            {order.modifiers.added.length > 0 && (
                              <div>
                                {order.modifiers.added.map((mod, mIdx) => (
                                  <div key={`added-${mIdx}`} className={mod.name === "sin gluten" ? "text-green-500" : "text-blue-500"}>
                                    {mod.name} {mod.price ? `(${mod.price.toFixed(2)}€)` : ""}
                                  </div>
                                ))}
                              </div>
                            )}
                            {order.modifiers.removed.length > 0 && (
                              <div className="text-red-500">
                                {order.modifiers.removed.map((mod, mIdx) => (
                                  <div key={`removed-${mIdx}`}>{mod.name}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {order.comments && order.comments.length > 0 && (
                          <div className="mt-1">
                            <strong>Notas adicionales:</strong>
                            {order.comments.map((comment, cIdx) => (
                              <div key={`comment-${cIdx}`}>{comment}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 mt-2">No hay pedidos en esta mesa.</p>
          )}
          <div className="text-right font-bold text-lg mt-2">
            Total: {currentTable.orders.reduce((acc, o) => acc + o.priceBase, 0).toFixed(2)}€
          </div>
          {currentTable.orders.some((order) => order.isSecond) && (
            <div className="flex gap-2 mt-4">
              <Button
                className={`flex-1 ${
                  currentTable.pedirSegundos ? "!bg-red-500 !text-white" : "!bg-orange-300 !text-black"
                } !font-bold py-2 px-4 rounded-md`}
                onClick={(e) => {
                  e.stopPropagation();
                  setTables((prev) =>
                    prev.map((tb) =>
                      tb.id === currentTable.id ? { ...tb, pedirSegundos: !tb.pedirSegundos } : tb
                    )
                  );
                  setSelectedTableForService((prev) =>
                    prev && prev.id === currentTable.id ? { ...prev, pedirSegundos: !prev.pedirSegundos } : prev
                  );
                }}
              >
                {currentTable.pedirSegundos ? "Segundos pedidos" : "Pedir Segundos"}
              </Button>
            </div>
          )}
          <div className="flex justify-end items-center">
            <Button
              className="flex-2 bg-green-500 text-white font-bold py-0.5 px-1 text-3xl rounded-3xl"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
                setModifierData(null);
                setModifierMode(null);
                setShowIngredientScreen(true);
              }}
            >
              +
            </Button>
          </div>
        </div>
      );
    } else {
      const allTables = tables;
      return (
        <div className="p-2">
          {allTables.length > 0 ? (
            <div className="grid grid-cols-6 gap-2">
              {allTables.map((table) => {
                const { bgClass, textClass } = getTableClassesForGeneral(table);
                const total = table.orders.reduce((acc, o) => acc + o.priceBase, 0);
                return (
                  <div key={table.id} className={`w-full h-full ${bgClass}`}>
                    <Card
                      className="cursor-pointer hover:shadow-lg transform transition bg-transparent h-full relative"
                      style={{ backgroundColor: "transparent" }}
                      onClick={() => setSelectedTableForService(table)}
                    >
                      {table.orders.some((order) => order.isSecond && !table.pedirSegundos) && (
                        <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full"></div>
                      )}
                      <CardContent className="p-2 bg-transparent h-full" style={{ backgroundColor: "transparent" }}>
                        <h2 className={textClass}>{table.name}</h2>
                        {table.orders.length > 0 ? (
                          <p className="text-lg font-bold">Total: {total.toFixed(2)}€</p>
                        ) : (
                          <p className="text-lg font-bold">Libre</p>
                        )}
                        {(table.notes || table.pickupTime) && (
                          <div className="mt-1 space-y-1">
                            {table.notes && <p className="text-lg font-bold">{table.notes}</p>}
                            {table.pickupTime && <p className="text-lg font-bold">{table.pickupTime}</p>}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">No hay mesas.</p>
          )}
        </div>
      );
    }
  }

  function handleCobrar(table: Table) {
    setCurrentCobrarTable(table);
    setShowCobrarDialog(true);
  }

  function finalizarCobro() {
    if (currentCobrarTable) {
      const completedOrders = currentCobrarTable.orders.filter(
        (order) => order.done || order.marchado
      );
      if (completedOrders.length === 0) return;
      const sale: Sale = {
        id: currentCobrarTable.id,
        tableName: currentCobrarTable.name,
        orders: completedOrders,
        total: completedOrders.reduce((acc, o) => acc + o.priceBase, 0),
        date: new Date().toISOString(),
      };
      setSales((prev) => [...prev, sale]);
      setTables((prev) =>
        prev.map((table) =>
          table.id === currentCobrarTable.id ? { ...table, orders: [], takenAt: undefined } : table
        )
      );
      setSelectedTableForService(null);
      setCurrentCobrarTable(null);
    }
  }

  // Función para guardar la nota en el pedido
  function handleSaveComment() {
    if (selectedTableForService && commentBoxIndex !== null) {
      const updatedOrder = { ...selectedTableForService.orders[commentBoxIndex] };
      const currentComments = updatedOrder.comments || [];
      updatedOrder.comments = [...currentComments, commentText];
      setTables((prev) =>
        prev.map((table) =>
          table.id === selectedTableForService.id
            ? { ...table, orders: table.orders.map((o, idx) => (idx === commentBoxIndex ? updatedOrder : o)) }
            : table
        )
      );
      setSelectedTableForService({
        ...selectedTableForService,
        orders: selectedTableForService.orders.map((o, idx) => (idx === commentBoxIndex ? updatedOrder : o)),
      });
      setCommentBoxIndex(null);
      setCommentText("");
    }
  }

  return (
    <div>
      <div className="fixed top-0 left-0 w-full bg-white shadow z-50">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab}>
          <TabsList>
            <TabsTrigger value="mesas" activeTab={activeTab} setActiveTab={setActiveTab}>
              Mesas
            </TabsTrigger>
            <TabsTrigger value="camareros" activeTab={activeTab} setActiveTab={setActiveTab}>
              Camareros
            </TabsTrigger>
            <TabsTrigger value="cocina" activeTab={activeTab} setActiveTab={setActiveTab}>
              Cocina
            </TabsTrigger>
            <TabsTrigger value="cocina2" activeTab={activeTab} setActiveTab={setActiveTab}>
              Cocina 2
            </TabsTrigger>
            <TabsTrigger value="servicio" activeTab={activeTab} setActiveTab={setActiveTab}>
              Servicio
            </TabsTrigger>
            <TabsTrigger value="reportes" activeTab={activeTab} setActiveTab={setActiveTab}>
              Reportes
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="pt-16">
        {activeTab === "mesas" && (
          <MesasTabComponent
            tables={tables}
            setTables={setTables}
            selectedTableForService={selectedTableForService}
            setSelectedTableForService={setSelectedTableForService}
            onCobrar={handleCobrar}
          />
        )}
        {activeTab === "camareros" && renderCamarerosView()}
        {activeTab === "cocina" && <CocinaScreen tables={tables} setTables={setTables} />}
        {activeTab === "cocina2" && <Cocina2Screen tables={tables} setTables={setTables} />}
        {activeTab === "servicio" && <ServicioScreen tables={tables} setTables={setTables} />}
        {activeTab === "reportes" && <ReportesScreen sales={sales} />}
      </div>

      {showCobrarDialog && (
        <Dialog open={showCobrarDialog} onOpenChange={(isOpen) => setShowCobrarDialog(isOpen)}>
          <DialogContent className="max-w-md w-full p-4">
            <DialogTitle className="text-xl font-bold mb-2">Método de pago</DialogTitle>
            <div className="flex space-x-4">
              <Button
                onClick={() => {
                  setPaymentMethod("efectivo");
                  setShowCobrarDialog(false);
                  setShowEntregadoDialog(true);
                }}
              >
                Efectivo
              </Button>
              <Button
                onClick={() => {
                  setPaymentMethod("tarjeta");
                  setShowCobrarDialog(false);
                  alert("Pago con tarjeta registrado.");
                  finalizarCobro();
                }}
              >
                Tarjeta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showEntregadoDialog && (
        <Dialog open={showEntregadoDialog} onOpenChange={(isOpen) => setShowEntregadoDialog(isOpen)}>
          <DialogContent className="max-w-md w-full p-4">
            <DialogTitle className="text-xl font-bold mb-2">Efectivo - Entregado</DialogTitle>
            <div className="flex items-center space-x-2">
              <span>Entregado:</span>
              <input
                type="number"
                value={deliveredAmount}
                onChange={(e) => setDeliveredAmount(e.target.value)}
                className="border rounded p-1 w-24"
              />
              <Button
                onClick={() => {
                  if (currentCobrarTable) {
                    const total = currentCobrarTable.orders.reduce((acc, o) => acc + o.priceBase, 0);
                    const delivered = parseFloat(deliveredAmount);
                    const change = delivered - total;
                    setChangeAmount(change);
                    setShowEntregadoDialog(false);
                    setShowCambioDialog(true);
                  }
                }}
              >
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showCambioDialog && (
        <Dialog open={showCambioDialog} onOpenChange={(isOpen) => setShowCambioDialog(isOpen)}>
          <DialogContent className="max-w-md w-full p-4">
            <DialogTitle className="text-xl font-bold mb-2">Cambio</DialogTitle>
            <p className="mb-4">
              {changeAmount > 0
                ? `Debe devolver: ${changeAmount.toFixed(2)}€`
                : "No hay cambio a devolver."}
            </p>
            <Button
              onClick={() => {
                setShowCambioDialog(false);
                setPaymentMethod(null);
                setDeliveredAmount("");
                setChangeAmount(0);
                finalizarCobro();
              }}
            >
              Cerrar
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {showIngredientScreen && (
        <Dialog
          open={showIngredientScreen}
          onOpenChange={(isOpen) => {
            setShowIngredientScreen(isOpen);
            if (!isOpen) {
              resetSelection();
            }
          }}
        >
          <DialogContent className="max-w-lg w-full p-4 space-y-4">
            <DialogTitle className="text-xl font-bold text-center mb-2">Seleccionar Pedido</DialogTitle>
            {modifierData ? (
              <div>
                <ul className="max-h-96 overflow-y-auto space-y-2">
                  {Object.entries(modifierData).map(([ingredientName, ingredientPrice]) => (
                    <li key={ingredientName}>
                      <Button
                        onClick={() => {
                          handleSelectModifier(ingredientName, ingredientPrice, modifierMode!);
                          setModifierData(null);
                          setModifierMode(null);
                        }}
                        className={`w-full text-left ${modifierMode === "remove" ? "bg-red-500 text-white" : ""}`}
                      >
                        {ingredientName} - {ingredientPrice}€
                      </Button>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end gap-2 mt-2">
                  <Button onClick={() => { setModifierData(null); setModifierMode(null); }} variant="outline">
                    Volver
                  </Button>
                  <Button
                    onClick={() => {
                      setShowIngredientScreen(false);
                      resetSelection();
                      setModifierData(null);
                      setModifierMode(null);
                    }}
                    variant="destructive"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            ) : !selectedCategory ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.keys(categorias).map((cat) => (
                    <Button key={cat} onClick={() => setSelectedCategory(cat)} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded shadow">
                      {cat}
                    </Button>
                  ))}
                </div>
                <div className="flex justify-end mt-2">
                  <Button onClick={() => { setShowIngredientScreen(false); resetSelection(); }} className="bg-red-500 hover:bg-red-500 text-white px-4 py-2 rounded">
                    Cerrar
                  </Button>
                </div>
              </>
            ) : (
              <>
                {(() => {
                  let currentData = categorias[selectedCategory];
                  if (selectedSubcategory) {
                    currentData = currentData[selectedSubcategory] || {};
                  }
                  if (Object.keys(currentData).length === 0) {
                    return (
                      <div className="text-center">
                        <p className="text-gray-600">No hay productos en esta categoría.</p>
                        <Button onClick={() => setSelectedSubcategory(null)} className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded">
                          Volver
                        </Button>
                      </div>
                    );
                  }
                  const productItems = Object.entries(currentData).filter(
                    ([, value]) =>
                      typeof value === "number" ||
                      (typeof value === "object" && value !== null && "price" in value)
                  );
                  const subcategories = Object.entries(currentData).filter(
                    ([, value]) =>
                      typeof value === "object" && value !== null && !("price" in value)
                  );
                  return (
                    <>
                      {productItems.length > 0 && (
                        <ul className="max-h-96 overflow-y-auto space-y-2">
                          {productItems.map(([productName, productValue]) =>
                            renderProductButton(productName, productValue)
                          )}
                        </ul>
                      )}
                      {subcategories.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                          {subcategories.map(([subcat]) => (
                            <Button key={subcat} onClick={() => setSelectedSubcategory(subcat)} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded shadow">
                              {subcat}
                            </Button>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          onClick={() => {
                            if (selectedSubcategory) {
                              setSelectedSubcategory(null);
                            } else {
                              resetSelection();
                            }
                          }}
                          variant="outline"
                        >
                          Volver
                        </Button>
                        <Button
                          onClick={() => {
                            setShowIngredientScreen(false);
                            resetSelection();
                            setModifierData(null);
                            setModifierMode(null);
                          }}
                          variant="destructive"
                        >
                          Cerrar
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </DialogContent>
        </Dialog>
      )}

      {showTimeDialog && (
        <Dialog
          open={showTimeDialog}
          onOpenChange={(isOpen) => {
            setShowTimeDialog(isOpen);
            if (!isOpen) {
              setTimeDialogOption(null);
              setManualTime("");
            }
          }}
        >
          <DialogContent className="max-w-md w-full p-4">
            <DialogTitle className="text-xl font-bold mb-2">Seleccionar Hora de Recogida</DialogTitle>
            {!timeDialogOption ? (
              <div className="flex flex-col gap-4">
                <Button onClick={() => setTimeDialogOption("prep")} className="bg-green-500 text-white px-4 py-2 rounded">
                  Tiempo de Preparación
                </Button>
                <Button onClick={() => setTimeDialogOption("manual")} className="bg-blue-500 text-white px-4 py-2 rounded">
                  Hora Manual
                </Button>
                <Button onClick={() => { setShowTimeDialog(false); setTimeDialogOption(null); }} className="bg-gray-500 text-white px-4 py-2 rounded">
                  Cerrar
                </Button>
              </div>
            ) : timeDialogOption === "manual" ? (
              <div className="flex flex-col gap-4">
                <input
                  type="time"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  onBlur={() => {
                    if (manualTime.length === 5) {
                      if (selectedTableForService) {
                        setTables((prev) =>
                          prev.map((t) =>
                            t.id === selectedTableForService.id ? { ...t, pickupTime: manualTime } : t
                          )
                        );
                        setSelectedTableForService((prev) =>
                          prev && prev.id === selectedTableForService.id
                            ? { ...prev, pickupTime: manualTime }
                            : prev
                        );
                      }
                      setShowTimeDialog(false);
                      setTimeDialogOption(null);
                      setManualTime("");
                    }
                  }}
                  className="border rounded p-1"
                />
                <Button onClick={() => { setShowTimeDialog(false); setTimeDialogOption(null); }} className="bg-gray-500 text-white px-4 py-2 rounded">
                  Cerrar
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-2">
                  {prepOptions.map((min) => (
                    <Button
                      key={min}
                      onClick={() => {
                        const now = new Date();
                        now.setMinutes(now.getMinutes() + min);
                        const hours = now.getHours().toString().padStart(2, "0");
                        const minutes = now.getMinutes().toString().padStart(2, "0");
                        const newTime = `${hours}:${minutes}`;
                        if (selectedTableForService) {
                          setTables((prev) =>
                            prev.map((t) =>
                              t.id === selectedTableForService.id ? { ...t, pickupTime: newTime } : t
                            )
                          );
                          setSelectedTableForService((prev) =>
                            prev && prev.id === selectedTableForService.id ? { ...prev, pickupTime: newTime } : prev
                          );
                        }
                        setShowTimeDialog(false);
                        setTimeDialogOption(null);
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      {min} min
                    </Button>
                  ))}
                </div>
                <Button onClick={() => { setShowTimeDialog(false); setTimeDialogOption(null); }} className="bg-gray-500 text-white px-4 py-2 rounded">
                  Cerrar
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo para agregar nota con autoFocus */}
      {commentBoxIndex !== null && (
        <Dialog
          open={true}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setCommentBoxIndex(null);
              setCommentText("");
            }
          }}
        >
          <DialogContent className="max-w-md w-full p-4">
            <DialogTitle className="text-xl font-bold mb-2">Agregar Nota</DialogTitle>
            <textarea
              autoFocus
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="Escribe tu nota aquí..."
            />
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => {
                  setCommentBoxIndex(null);
                  setCommentText("");
                }}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveComment}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
