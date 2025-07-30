"use client"

import { useState, useEffect } from "react"
import { Switch } from "antd"

const Field = ({ label, isHorizontal }) => {
  return (
    <div className={`${isHorizontal ? "min-w-[200px] flex-shrink-0" : "mb-2"}`}>
      <div className="text-slate-900 text-sm font-medium uppercase tracking-wider">{label}</div>
    </div>
  )
}

const Checkbox = ({ checked, onPress, label, isEditing }) => (
  <div className="flex items-center py-2 px-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={onPress}>
    <div
      className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center transition-colors ${
        checked ? "bg-purple-600 border-purple-600" : "bg-white border-gray-400"
      }`}
    >
      {checked && <span className="text-white text-xs font-bold">✓</span>}
    </div>
    <span className="text-sm text-gray-700 flex-1">{label}</span>
  </div>
)

const LayoutSection = ({ formData, visibleFields, layout, title, sectionIndex, hideLayoutLables = false }) => {
  const renderField = (elementId) => {
    if (!visibleFields.includes(elementId)) return null
    const element = formData?.elements?.find((el) => {
      const elId = el.id || el._id || elementId
      return elId.toString() === elementId.toString()
    })
    if (!element) return null
    const label = element.properties?.label || `Field ${elementId}`
    return (
      <div key={elementId} className="space-y-1">
        <div className="text-sm text-gray-600">{label}: value</div>
      </div>
    )
  }

  if (visibleFields.length === 0) return null

  if (hideLayoutLables) {
    return (
      <div className="mb-4">
        {layout === "horizontal" ? (
          <div className="flex justify-items-start gap-8">
            {visibleFields.map((elementId) => renderField(elementId))}
          </div>
        ) : (
          <div className="space-y-4">{visibleFields.map((elementId) => renderField(elementId))}</div>
        )}
      </div>
    )
  }

  return (
    <div className="border-b border-gray-100 pb-6 last:border-b-0">
      <h3 className="text-base font-medium text-gray-900 mb-4">{title}</h3>
      {layout === "horizontal" ? (
        <div className="flex justify-items-start gap-8">{visibleFields.map((elementId) => renderField(elementId))}</div>
      ) : (
        <div className="space-y-4">{visibleFields.map((elementId) => renderField(elementId))}</div>
      )}
    </div>
  )
}

const DynamicCard = ({
  formData,
  layoutSelections,
  currentSectionIndex,
  setCurrentSectionIndex,
  setLayout,
  onSaveCard,
  onDoneEditing,
}) => {
  const validSelections = layoutSelections.filter((selection) => selection.fields && selection.fields.length > 0)
  if (validSelections.length === 0) return null

  return (
    <div className="flex flex-row justify-between items-center">
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 w-[50vw]">
        {/* Header with tabs and save button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Layout selection order</span>
            <div className="flex space-x-2 ml-4">
              {validSelections.map((selection, index) => {
                const originalIndex = layoutSelections.findIndex((s) => s === selection)
                const isActive = originalIndex === currentSectionIndex
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSectionIndex(originalIndex)
                      setLayout(selection.layout)
                    }}
                    className={`px-3 py-1 text-sm border rounded transition-colors ${
                      isActive
                        ? "border-gray-400 bg-gray-100 text-gray-900"
                        : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {index + 1}.{selection.layout.charAt(0).toUpperCase() + selection.layout.slice(1)} layout
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Done Editing Button - shows when editing an existing section */}
            {currentSectionIndex !== null && (
              <button
                onClick={onDoneEditing}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Done Editing</span>
              </button>
            )}
            <button
              onClick={() => onSaveCard(formData, validSelections)}
              disabled={currentSectionIndex !== null}
              className={`px-4 py-2 text-sm font-medium rounded ${
                currentSectionIndex !== null
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              Save card
            </button>
          </div>
        </div>
        {/* Layout sections */}
        <div className="space-y-8">
          {validSelections.map((section, index) => {
            const sectionCount = validSelections.filter((s) => s.layout === section.layout).slice(0, index + 1).length
            return (
              <LayoutSection
                key={`${section.layout}-${index}`}
                formData={formData}
                visibleFields={section.fields}
                layout={section.layout}
                title={`${index + 1}.${section.layout.charAt(0).toUpperCase() + section.layout.slice(1)} layout`}
                sectionIndex={sectionCount}
              />
            )
          })}
        </div>
      </div>
      <div className="w-[45vw]">
        <h5>Card preview</h5>
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 w-[35vw]">
          {/* Layout sections */}
          <div className="space-y-8">
            {validSelections.map((section, index) => {
              const sectionCount = validSelections.filter((s) => s.layout === section.layout).slice(0, index + 1).length
              return (
                <LayoutSection
                  key={`${section.layout}-${index}`}
                  formData={formData}
                  visibleFields={section.fields}
                  layout={section.layout}
                  title={`${index + 1}.${section.layout.charAt(0).toUpperCase() + section.layout.slice(1)} layout`}
                  sectionIndex={sectionCount}
                  hideLayoutLables
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const FieldSelector = ({
  allFields,
  selectedFields,
  onToggle,
  currentLayout,
  currentSectionIndex,
  layoutSelections,
  formData,
}) => {
  const sectionNumber = currentSectionIndex !== null ? currentSectionIndex + 1 : layoutSelections.length + 1
  const isEditingExisting = currentSectionIndex !== null

  // Replace the existing column splitting logic with this:
  const ITEMS_PER_COLUMN = 6
  const column1 = allFields.slice(0, ITEMS_PER_COLUMN)
  const column2 = allFields.slice(ITEMS_PER_COLUMN, ITEMS_PER_COLUMN * 2)
  const column3 = allFields.slice(ITEMS_PER_COLUMN * 2, ITEMS_PER_COLUMN * 3)

  const renderColumn = (columnFields) => (
    <div className="bg-white border border-gray-300 rounded-lg p-4 min-h-[200px]">
      <div className="space-y-1">
        {columnFields.map((elementId) => {
          const element = formData?.elements?.find((el) => {
            const elId = el.id || el._id || elementId
            return elId.toString() === elementId.toString()
          })
          const label = element?.properties?.label || `Field ${elementId}`
          return (
            <Checkbox
              key={elementId}
              checked={selectedFields.includes(elementId)}
              onPress={() => onToggle(elementId)}
              label={label}
              isEditing={isEditingExisting}
            />
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="mb-2">
      {/* Header Section */}
   
      {/* Three Column Grid with Borders */}
      <div className="grid grid-cols-3 gap-6">
        {renderColumn(column1)}
        {renderColumn(column2)}
        {renderColumn(column3)}
      </div>
    </div>
  )
}

const DynamicCardDemo = () => {
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [allFields, setAllFields] = useState([])
  const [saveStatus, setSaveStatus] = useState("")
  const [layout, setLayout] = useState("vertical")
  const [layoutSelections, setLayoutSelections] = useState([])
  const [currentSectionIndex, setCurrentSectionIndex] = useState(null)
  const [currentFields, setCurrentFields] = useState([])
  const [loadSavedEnabled, setLoadSavedEnabled] = useState(false)
  const [pageSlug, setPageSlug] = useState("")

  const fetchData = async () => {
    try {
      setError(null)
      const response = await fetch("http://localhost:3000/api-root/krisiyukta-dev/api/form/load?slug=onboard")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()

      const slug = result?.slug || "Unknown Page"
      setPageSlug(slug)

      let formData = null
      let elements = []

      if (result && result.schema && Array.isArray(result.schema)) {
        const firstSchema = result.schema[0]
        if (firstSchema && firstSchema.elements && Array.isArray(firstSchema.elements)) {
          formData = {
            id: firstSchema.id || "schema-1",
            name: firstSchema.name || slug,
            elements: firstSchema.elements,
            slug: slug,
          }
          elements = firstSchema.elements
        }
      }

      if (!elements || !Array.isArray(elements) || elements.length === 0) {
        throw new Error("No valid form elements found in API response")
      }

      const validElements = elements.filter((element) => {
        return element && element.properties && element.properties.label
      })

      if (validElements.length === 0) {
        throw new Error("No elements found with properties.label structure")
      }

      formData.elements = validElements
      setFormData(formData)

      const availableFields = validElements.map((element, index) => {
        const id = element.id || element._id || `element_${index}`
        return id.toString()
      })

      setAllFields(availableFields)
      setCurrentFields([])

      // REMOVED: Automatic loading of saved configuration
      // Only load if the switch is already enabled (shouldn't happen on first load)
      if (loadSavedEnabled && formData && formData.id) {
        console.log("🚀 Form loaded, attempting to load saved configuration...")
        await loadSavedConfiguration(formData.id)
      }
    } catch (error) {
      setError(`Failed to fetch data: ${error.message}`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const loadSavedConfiguration = async (formId) => {
    try {
      console.log("🔄 Loading saved configuration for form:", formId)
      const response = await fetch(`http://localhost:5000/get-card/${formId}`)
      
      if (response.ok) {
        const savedConfig = await response.json()
        console.log("📦 Retrieved saved config:", savedConfig)
        
        if (savedConfig.layoutSelections && savedConfig.layoutSelections.length > 0) {
          setLayoutSelections(savedConfig.layoutSelections)
          setSaveStatus(`✅ Loaded ${savedConfig.layoutSelections.length} saved sections from database!`)
          setTimeout(() => setSaveStatus(""), 4000)
          return true
        } else {
          setSaveStatus("ℹ️ Configuration found but no layout selections")
          setTimeout(() => setSaveStatus(""), 3000)
          return false
        }
      } else if (response.status === 404) {
        console.log("🔍 No saved configuration found for form:", formId)
        setSaveStatus("ℹ️ No saved configuration found in database for this form")
        setTimeout(() => setSaveStatus(""), 3000)
        return false
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Load configuration error:", error)
      setSaveStatus(`⚠️ Failed to load saved configuration: ${error.message}`)
      setTimeout(() => setSaveStatus(""), 4000)
      return false
    }
  }

  const clearSavedConfiguration = () => {
    setLayoutSelections([])
    setCurrentSectionIndex(null)
    setCurrentFields([])
    setSaveStatus("✅ Cleared configuration from view (database data preserved)")
    setTimeout(() => setSaveStatus(""), 3000)
  }

  const handleLoadSavedToggle = async (enabled) => {
    setLoadSavedEnabled(enabled)
    if (!enabled) {
      // When turning OFF, clear all layout data immediately
      clearSavedConfiguration()
    } else {
      // When turning ON, try to load saved configuration
      if (formData && formData.id) {
        await loadSavedConfiguration(formData.id)
      }
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    // Clear layout data on refresh
    setLayoutSelections([])
    setCurrentSectionIndex(null)
    setCurrentFields([])
    fetchData()
  }

  // Modified to use formId and provide better feedback
  const saveCardToBackend = async (formData, layoutSelections) => {
    try {
      setSaveStatus("💾 Saving to database...")
      const validLayoutSelections = layoutSelections.filter(
        (selection) => selection.fields && selection.fields.length > 0,
      )

      if (validLayoutSelections.length === 0) {
        setSaveStatus("⚠️ No sections with fields to save!")
        setTimeout(() => setSaveStatus(""), 3000)
        return
      }

      const payload = {
        formId: formData.id,
        formData: formData,
        layoutSelections: validLayoutSelections,
      }

      console.log("💾 Saving configuration for form:", formData.id)
      console.log("📊 Payload:", payload)

      const response = await fetch("http://localhost:5000/save-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Server error: ${errorData.error || 'Unknown error'}`)
      }

      const result = await response.json()
      console.log("✅ Save result:", result)
      setSaveStatus(`✅ Saved ${validLayoutSelections.length} sections to database permanently!`)
      setTimeout(() => setSaveStatus(""), 4000)
    } catch (error) {
      console.error("❌ Save error:", error)
      setSaveStatus(`❌ Save failed: ${error.message}`)
      setTimeout(() => setSaveStatus(""), 4000)
    }
  }

  const toggleField = (elementId) => {
    if (currentSectionIndex !== null) {
      setLayoutSelections((prev) => {
        const updated = [...prev]
        const section = { ...updated[currentSectionIndex] }
        if (section.fields.includes(elementId)) {
          section.fields = section.fields.filter((f) => f !== elementId)
        } else {
          section.fields = [...section.fields, elementId]
        }
        updated[currentSectionIndex] = section
        return updated
      })
    } else {
      setCurrentFields((prev) => {
        if (prev.includes(elementId)) {
          return prev.filter((f) => f !== elementId)
        } else {
          return [...prev, elementId]
        }
      })
    }
  }

  const cleanupEmptySections = () => {
    setLayoutSelections((prev) => prev.filter((section) => section.fields && section.fields.length > 0))
  }

  const handleDoneEditing = () => {
    setCurrentSectionIndex(null)
    setCurrentFields([])
    cleanupEmptySections()
  }

  const handleLayoutSelection = (selectedLayout) => {
    if (currentSectionIndex !== null) {
      return
    }

    const fieldsToUse = currentFields.length > 0 ? currentFields : []
    setLayout(selectedLayout)
    setLayoutSelections((prev) => [
      ...prev,
      {
        layout: selectedLayout,
        fields: [...fieldsToUse],
        timestamp: Date.now(),
      },
    ])
    setCurrentFields([])
    setCurrentSectionIndex(null)
  }

  const getCurrentFields = () => {
    if (currentSectionIndex !== null) {
      const section = layoutSelections[currentSectionIndex]
      return section?.fields || []
    }
    return currentFields
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-lg">Loading form data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onRefresh}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!formData || !formData.elements || formData.elements.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-6 rounded-lg shadow-lg max-w-md">
          <div className="text-gray-400 text-4xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Form Elements Found</h2>
          <p className="text-gray-600 mb-4">No form elements were found in the API response.</p>
          <button
            onClick={onRefresh}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Page name:</span>
              <span className="text-sm font-semibold text-gray-900">
                {pageSlug || formData?.slug || "Unknown Page"}
              </span>
            </div>
            {/* Show form ID and database status */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Form ID:</span>
              <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{formData?.id}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Database:</span>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">MongoDB Connected</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <Switch
                checked={loadSavedEnabled}
                onChange={handleLoadSavedToggle}
                size="default"
                style={{
                  backgroundColor: loadSavedEnabled ? "#9333ea" : undefined,
                }}
              />
              <span className="text-sm font-medium text-gray-700">Load saved configuration</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Layout type</span>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="layout"
                    value="vertical"
                    checked={layout === "vertical"}
                    onChange={(e) => setLayout(e.target.value)}
                    disabled={currentSectionIndex !== null}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Vertical layout</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="layout"
                    value="horizontal"
                    checked={layout === "horizontal"}
                    onChange={(e) => setLayout(e.target.value)}
                    disabled={currentSectionIndex !== null}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Horizontal layout</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Page Info */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">Page 1 of {formData.elements.length} elements loaded</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{refreshing ? "Refreshing..." : "Refresh data"}</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {/* Save Status */}
            {saveStatus && (
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{saveStatus}</span>
            )}
            {/* Create Layout Button - only shows when not editing and fields are selected */}
            {currentFields.length > 0 && currentSectionIndex === null && (
              <button
                onClick={() => handleLayoutSelection(layout)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg"
              >
                Create layout ({currentFields.length} selected)
              </button>
            )}
          </div>
        </div>

        {/* Field Selector */}
        <FieldSelector
          allFields={allFields}
          selectedFields={getCurrentFields()}
          onToggle={toggleField}
          currentLayout={layout}
          currentSectionIndex={currentSectionIndex}
          layoutSelections={layoutSelections}
          formData={formData}
        />

        {/* Dynamic Card */}
        <DynamicCard
          formData={formData}
          layoutSelections={layoutSelections}
          currentSectionIndex={currentSectionIndex}
          setCurrentSectionIndex={setCurrentSectionIndex}
          setLayout={setLayout}
          onSaveCard={saveCardToBackend}
          onDoneEditing={handleDoneEditing}
        />
      </div>
    </div>
  )
}

export default DynamicCardDemo