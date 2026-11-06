"use client"

import React, { useState, useEffect } from "react"
import type { VehicleType } from "@/types"
import { VEHICLE_TYPES, getBrandsForType } from "@/lib/vehicle-catalog"

export interface VehicleFormData {
  type: VehicleType
  make: string
  model: string
  plate: string
  year: number
  mileage: number
  color: string
  vin: string
}

interface VehicleFormFieldsProps {
  initialData?: Partial<VehicleFormData>
  onChange?: (data: VehicleFormData) => void
  disabled?: boolean
  showLabels?: boolean
  compact?: boolean
}

export function VehicleFormFields({
  initialData,
  onChange,
  disabled = false,
  showLabels = true,
  compact = false,
}: VehicleFormFieldsProps) {
  const [vehicleType, setVehicleType] = useState<VehicleType>(initialData?.type ?? "CAR")
  const [selectedBrand, setSelectedBrand] = useState<string>(() => {
    if (!initialData?.make) return ""
    const brands = getBrandsForType(initialData.type ?? "CAR")
    return brands.includes(initialData.make) ? initialData.make : "__OTHER__"
  })
  const [customBrand, setCustomBrand] = useState<string>(() => {
    if (!initialData?.make) return ""
    const brands = getBrandsForType(initialData.type ?? "CAR")
    return brands.includes(initialData.make) ? "" : initialData.make
  })
  const [model, setModel] = useState(initialData?.model ?? "")
  const [plate, setPlate] = useState(initialData?.plate ?? "")
  const [year, setYear] = useState(initialData?.year ?? new Date().getFullYear())
  const [mileage, setMileage] = useState(initialData?.mileage ?? 0)
  const [color, setColor] = useState(initialData?.color ?? "")
  const [vin, setVin] = useState(initialData?.vin ?? "")

  const brandsList = getBrandsForType(vehicleType)
  const isCustomBrand = selectedBrand === "__OTHER__"
  const effectiveMake = isCustomBrand ? customBrand.trim() : selectedBrand

  // Sync to parent when fields change
  useEffect(() => {
    onChange?.({
      type: vehicleType,
      make: effectiveMake,
      model,
      plate: plate.toUpperCase().replace(/[\s-.]/g, ""),
      year: Number(year) || 0,
      mileage: Number(mileage) || 0,
      color,
      vin,
    })
  }, [vehicleType, effectiveMake, model, plate, year, mileage, color, vin, onChange])

  const handleTypeChange = (type: VehicleType) => {
    setVehicleType(type)
    const newBrands = getBrandsForType(type)
    // If the currently written or selected brand isn't in the new brand list, switch to custom brand
    if (selectedBrand !== "__OTHER__" && !newBrands.includes(selectedBrand)) {
      if (selectedBrand) {
        setCustomBrand(selectedBrand)
        setSelectedBrand("__OTHER__")
      } else {
        setSelectedBrand("")
      }
    }
  }

  const handleBrandSelect = (val: string) => {
    setSelectedBrand(val)
    if (val !== "__OTHER__") {
      setCustomBrand("")
    }
  }

  const gridCols = compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"

  return (
    <div className="space-y-4">
      {/* 1. Selector de Tipo de Vehículo */}
      <div>
        {showLabels && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-fg-2 mb-2">
            Tipo de Vehículo
          </label>
        )}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {VEHICLE_TYPES.map((t) => {
            const isSelected = vehicleType === t.value
            return (
              <button
                key={t.value}
                type="button"
                disabled={disabled}
                onClick={() => handleTypeChange(t.value)}
                className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-sm font-medium transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-sm"
                    : "border-line bg-surface hover:border-fg-3/40 text-fg-2 hover:text-fg"
                }`}
              >
                <span className="text-xl" role="img" aria-label={t.shortLabel}>
                  {t.icon}
                </span>
                <div className="truncate">
                  <div className="font-semibold text-fg leading-tight">{t.shortLabel}</div>
                  <div className="text-[11px] text-fg-3 truncate">{t.value === "CAR" ? "Auto / Camioneta" : t.value === "MOTORCYCLE" ? "2 ruedas" : t.value === "ATV" ? "4x4 / Cuatri" : "Pesado / Otro"}</div>
                </div>
              </button>
            )
          })}
        </div>
        <input type="hidden" name="type" value={vehicleType} />
      </div>

      {/* 2. Marca del Vehículo: Selector + Opción de Escribir */}
      <div className={`grid gap-3 ${compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
        <div>
          {showLabels && (
            <label className="block text-xs font-medium text-fg-2 mb-1">
              Marca del vehículo <span className="text-red-500">*</span>
            </label>
          )}
          <select
            className="field h-10 w-full"
            value={selectedBrand}
            onChange={(e) => handleBrandSelect(e.target.value)}
            disabled={disabled}
            required={!isCustomBrand}
          >
            <option value="">-- Seleccionar marca ({brandsList.length} opciones) --</option>
            {brandsList.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
            <option value="__OTHER__">✍️ Otra marca (escribir a mano)...</option>
          </select>
        </div>

        {/* Campo de texto si no está en la lista o eligió otra */}
        {isCustomBrand && (
          <div className="animate-fade-in">
            {showLabels && (
              <label className="block text-xs font-medium text-fg-2 mb-1">
                Escribe la marca no registrada <span className="text-red-500">*</span>
              </label>
            )}
            <input
              type="text"
              className="field h-10 w-full font-medium"
              placeholder="Escribe la marca (ej: Can-Am, AKT, Bajaj...)"
              value={customBrand}
              onChange={(e) => setCustomBrand(e.target.value)}
              disabled={disabled}
              required={isCustomBrand}
              autoFocus
            />
          </div>
        )}

        {/* Input oculto con el valor final de la marca para FormData */}
        <input type="hidden" name="make" value={effectiveMake} />
      </div>

      {/* 3. Datos principales: Placa, Modelo, Año, Kilometraje */}
      <div className={`grid gap-3 ${gridCols}`}>
        <div>
          {showLabels && (
            <label className="block text-xs font-medium text-fg-2 mb-1">
              Placa <span className="text-red-500">*</span>
            </label>
          )}
          <input
            className="field h-10 w-full uppercase font-mono font-bold tracking-wider"
            name="plate"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder={vehicleType === "MOTORCYCLE" ? "ABC12D" : vehicleType === "ATV" ? "ATV01 o placa" : "ABC123"}
            minLength={3}
            maxLength={10}
            required
            disabled={disabled}
          />
          <p className="mt-1 text-[11px] text-fg-3">
            {vehicleType === "CAR" && "Formato ej: ABC123"}
            {vehicleType === "MOTORCYCLE" && "Formato ej: ABC12D o ABC123"}
            {vehicleType === "ATV" && "Placa o identificador ej: ATV01, 4X401"}
            {vehicleType === "OTHER" && "3 a 10 caracteres alfanuméricos"}
          </p>
        </div>

        <div>
          {showLabels && (
            <label className="block text-xs font-medium text-fg-2 mb-1">
              Línea / Modelo <span className="text-fg-3 font-normal">(opcional)</span>
            </label>
          )}
          <input
            className="field h-10 w-full"
            name="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={
              vehicleType === "CAR"
                ? "Ej: Hilux, Sandero, Duster"
                : vehicleType === "MOTORCYCLE"
                ? "Ej: FZ-25, Pulsar NS200, NMAX"
                : vehicleType === "ATV"
                ? "Ej: Outlander 570, Raptor 700"
                : "Ej: Serie 300, NKR"
            }
            disabled={disabled}
          />
        </div>

        <div>
          {showLabels && (
            <label className="block text-xs font-medium text-fg-2 mb-1">
              Año <span className="text-red-500">*</span>
            </label>
          )}
          <input
            className="field h-10 w-full"
            type="number"
            name="year"
            min={1950}
            max={new Date().getFullYear() + 2}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            placeholder="Año"
            required
            disabled={disabled}
          />
        </div>

        <div>
          {showLabels && (
            <label className="block text-xs font-medium text-fg-2 mb-1">
              Kilometraje actual <span className="text-red-500">*</span>
            </label>
          )}
          <input
            className="field h-10 w-full"
            type="number"
            name="mileage"
            min={0}
            value={mileage}
            onChange={(e) => setMileage(Number(e.target.value))}
            placeholder="Km"
            required
            disabled={disabled}
          />
        </div>

        <div>
          {showLabels && (
            <label className="block text-xs font-medium text-fg-2 mb-1">
              Color <span className="text-fg-3 font-normal">(opcional)</span>
            </label>
          )}
          <input
            className="field h-10 w-full"
            name="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Ej: Rojo, Blanco, Negro"
            disabled={disabled}
          />
        </div>

        <div>
          {showLabels && (
            <label className="block text-xs font-medium text-fg-2 mb-1">
              VIN / Nro. Chasis <span className="text-fg-3 font-normal">(opcional)</span>
            </label>
          )}
          <input
            className="field h-10 w-full font-mono text-xs uppercase"
            name="vin"
            value={vin}
            onChange={(e) => setVin(e.target.value.toUpperCase())}
            placeholder="Número de serie o chasis"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
