'use client'

import type { MenuItem } from '@/payload-types'
import { formatToEuro } from '@/utilities'
import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Label,
  PriceDisplay,
  QuantitySelector,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from '..'

interface MenuItemModalProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (orderItem: OrderItem) => void
}

export interface KeuzemenuOption {
  label: string
  price?: number | null
  id?: string | null
}

export interface OrderItem {
  menuItem: MenuItem
  quantity: number
  customWishes: string
  keuzemenuSelections: {
    questionId: string
    question: string
    answer: string | string[]
    price?: number | null
  }[]
}

export const MenuItemModal = ({ item, isOpen, onClose, onAddToCart }: MenuItemModalProps) => {
  const [quantity, setQuantity] = useState(1)
  const [customWishes, setCustomWishes] = useState('')
  const [keuzemenuSelections, setKeuzemenuSelections] = useState<
    {
      questionId: string
      question: string
      answer: string | string[]
      price?: number | null
    }[]
  >([])

  const handleClose = () => {
    setQuantity(1)
    setCustomWishes('')
    setKeuzemenuSelections([])
    onClose()
  }

  const handleAddToCart = () => {
    if (!item) return

    const orderItem: OrderItem = {
      menuItem: item,
      quantity,
      customWishes,
      keuzemenuSelections,
    }

    onAddToCart(orderItem)
    handleClose()
  }

  const handleRadioSelection = (
    questionId: string,
    question: string,
    selectedOption: KeuzemenuOption,
  ) => {
    setKeuzemenuSelections((prev) => {
      // Remove any existing selection for this question
      const filtered = prev.filter((selection) => selection.questionId !== questionId)

      // Add the new selection
      return [
        ...filtered,
        {
          questionId,
          question,
          answer: selectedOption.label,
          price: selectedOption.price,
        },
      ]
    })
  }

  const handleCheckboxSelection = (
    questionId: string,
    question: string,
    selectedOption: KeuzemenuOption,
    checked: boolean,
  ) => {
    setKeuzemenuSelections((prev) => {
      // Find existing selection for this question
      const existingSelection = prev.find((selection) => selection.questionId === questionId)

      if (!existingSelection) {
        // No existing selection, create new one
        if (checked) {
          return [
            ...prev,
            {
              questionId,
              question,
              answer: [selectedOption.label],
              price: selectedOption.price,
            },
          ]
        }
        return prev
      }

      // Handle existing selection
      const currentAnswers = Array.isArray(existingSelection.answer)
        ? existingSelection.answer
        : [existingSelection.answer]

      let newAnswers: string[]
      let newPrice: number | null = null

      if (checked) {
        // Add option if not already present
        if (!currentAnswers.includes(selectedOption.label)) {
          newAnswers = [...currentAnswers, selectedOption.label]
        } else {
          newAnswers = currentAnswers
        }
      } else {
        // Remove option
        newAnswers = currentAnswers.filter((answer) => answer !== selectedOption.label)
      }

      // Calculate total price for this question
      const questionOptions =
        getKeuzemenuQuestions().find((q) => q.id === questionId)?.options || []
      newPrice = newAnswers.reduce((total, answer) => {
        const option = questionOptions.find((opt) => opt.label === answer)
        return total + (option?.price || 0)
      }, 0)

      // Update or remove the selection
      const filtered = prev.filter((selection) => selection.questionId !== questionId)

      if (newAnswers.length > 0) {
        return [
          ...filtered,
          {
            questionId,
            question,
            answer: newAnswers,
            price: newPrice,
          },
        ]
      }

      return filtered
    })
  }

  const handleTextInput = (questionId: string, question: string, textValue: string) => {
    setKeuzemenuSelections((prev) => {
      // Remove any existing selection for this question
      const filtered = prev.filter((selection) => selection.questionId !== questionId)

      // Add the new text input if not empty
      if (textValue.trim()) {
        return [
          ...filtered,
          {
            questionId,
            question,
            answer: textValue.trim(),
            price: null, // Text inputs typically don't have prices
          },
        ]
      }

      return filtered
    })
  }

  const getKeuzemenuQuestions = (): Array<{
    id: string
    question: string
    questionType: 'radio' | 'checkbox' | 'text'
    options: KeuzemenuOption[]
  }> => {
    if (!item?.keuzemenus) return []

    const questions: Array<{
      id: string
      question: string
      questionType: 'radio' | 'checkbox' | 'text'
      options: KeuzemenuOption[]
    }> = []

    item.keuzemenus.forEach((keuzemenu) => {
      if (typeof keuzemenu === 'object' && keuzemenu.Vragen?.questions) {
        keuzemenu.Vragen.questions.forEach((q) => {
          if (q && typeof q === 'object') {
            questions.push({
              id: q.id || `${keuzemenu.id}-${q.question}`,
              question: q.question,
              questionType: q.questionType || 'radio',
              options: q.options || [],
            })
          }
        })
      }
    })

    return questions
  }

  const calculateTotalPrice = (): number => {
    if (!item) return 0

    let total = item.price * quantity

    // Add keuzemenu option prices
    keuzemenuSelections.forEach((selection) => {
      if (selection.price) {
        total += selection.price * quantity
      }
    })

    return total
  }

  if (!item) return null

  const keuzemenuQuestions = getKeuzemenuQuestions()

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl rounded-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{item.title}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quantity Selector */}
          <QuantitySelector value={quantity} onChange={setQuantity} min={1} />

          {/* Keuzemenu Questions */}
          {keuzemenuQuestions.map((question) => (
            <div key={question.id} className="space-y-3">
              <Label className="text-base font-medium">{question.question}</Label>

              {question.questionType === 'text' ? (
                <div className="space-y-2">
                  <Input
                    placeholder={`Voer je antwoord in voor: ${question.question}`}
                    value={
                      (keuzemenuSelections.find((s) => s.questionId === question.id)
                        ?.answer as string) || ''
                    }
                    onChange={(e) =>
                      handleTextInput(question.id, question.question, e.target.value)
                    }
                  />
                </div>
              ) : question.questionType === 'radio' ? (
                <RadioGroup
                  value={(() => {
                    const selection = keuzemenuSelections.find((s) => s.questionId === question.id)
                    if (selection && typeof selection.answer === 'string') {
                      const option = question.options.find((o) => o.label === selection.answer)
                      return option?.id?.toString() || ''
                    }
                    return ''
                  })()}
                  onValueChange={(value: string) => {
                    const selectedOption = question.options.find((o) => o.id?.toString() === value)
                    if (selectedOption) {
                      handleRadioSelection(question.id, question.question, selectedOption)
                    }
                  }}
                >
                  {question.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option.id?.toString() || ''}
                        id={`${question.id}-${option.id}`}
                      />
                      <Label
                        htmlFor={`${question.id}-${option.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <span>{option.label}</span>
                          {option.price && option.price > 0 && (
                            <span className="text-sm text-muted-foreground">
                              {formatToEuro(option.price)}
                            </span>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {question.options.map((option) => {
                    const selection = keuzemenuSelections.find((s) => s.questionId === question.id)
                    const isChecked =
                      selection && Array.isArray(selection.answer)
                        ? selection.answer.includes(option.label)
                        : false

                    return (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question.id}-${option.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            handleCheckboxSelection(
                              question.id,
                              question.question,
                              option,
                              checked as boolean,
                            )
                          }}
                        />
                        <Label
                          htmlFor={`${question.id}-${option.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex justify-between items-center">
                            <span>{option.label}</span>
                            {option.price && option.price > 0 && (
                              <span className="text-sm text-muted-foreground">
                                {formatToEuro(option.price)}
                              </span>
                            )}
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Custom Wishes */}
          <FormField label="Speciale wensen (optioneel)" htmlFor="customWishes">
            <Textarea
              id="customWishes"
              placeholder="Bijvoorbeeld: zonder ui, extra pittig, etc."
              value={customWishes}
              onChange={(e) => setCustomWishes(e.target.value)}
              rows={3}
            />
          </FormField>

          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Samenvatting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>
                  {item.title} × {quantity}
                </span>
                <PriceDisplay price={item.price * quantity} />
              </div>
              {Object.entries(keuzemenuSelections).map(([questionId, selectedOption]) => {
                if (Array.isArray(selectedOption)) {
                  // Multiple selections (checkbox)
                  return selectedOption.map((option) => (
                    <div
                      key={`${questionId}-${option.id}`}
                      className="flex justify-between text-sm text-muted-foreground"
                    >
                      <span>
                        {option.label} × {quantity}
                      </span>
                      <PriceDisplay
                        price={(option.price || 0) * quantity}
                        size="sm"
                        variant="muted"
                      />
                    </div>
                  ))
                } else {
                  // Single selection (radio)
                  return (
                    <div
                      key={questionId}
                      className="flex justify-between text-sm text-muted-foreground"
                    >
                      <span>
                        {selectedOption.answer} × {quantity}
                      </span>
                      <PriceDisplay
                        price={(selectedOption.price || 0) * quantity}
                        size="sm"
                        variant="muted"
                      />
                    </div>
                  )
                }
              })}
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Totaal</span>
                <PriceDisplay price={calculateTotalPrice()} size="lg" />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuleren
          </Button>
          <Button onClick={handleAddToCart}>Toevoegen aan bestelling</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
