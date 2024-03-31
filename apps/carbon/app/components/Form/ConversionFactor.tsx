import {
  Button,
  CommandTrigger,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  NumberDecrementStepper,
  NumberField,
  NumberIncrementStepper,
  NumberInput,
  NumberInputGroup,
  NumberInputStepper,
  VStack,
} from "@carbon/react";
import { useControlField, useField } from "@carbon/remix-validated-form";
import { twoDecimals } from "@carbon/utils";
import type { ElementRef } from "react";
import { forwardRef, useMemo, useRef, useState } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { MdTranslate } from "react-icons/md";
import { useUnitOfMeasure } from "./UnitOfMeasure";

enum ConversionDirection {
  PurchasedToInventory,
  InventoryToPurchased,
}

type ConversionFactorProps = {
  name: string;
  label?: string;
  inventoryCode?: string;
  purchasingCode?: string;
  isReadOnly?: boolean;
  isRequired?: boolean;
  helperText?: string;
  onChange?: (newValue: number) => void;
};

const ConversionFactor = forwardRef<
  ElementRef<typeof CommandTrigger>,
  ConversionFactorProps
>(
  (
    {
      name,
      label = "Conversion Factor",
      isRequired,
      isReadOnly,
      helperText,
      onChange,
      purchasingCode,
      inventoryCode,
    },
    ref
  ) => {
    const { getInputProps, error, defaultValue } = useField(name);
    const [controlValue, setControlValue] = useControlField<number>(name);

    const [open, setOpen] = useState(false);
    const initialValue = useRef(defaultValue);

    const [conversionFactor, setConversionFactor] = useState(
      initialValue.current
    );

    const [conversionDirection, setConversionDirection] = useState(
      conversionFactor > 1
        ? ConversionDirection.PurchasedToInventory
        : ConversionDirection.InventoryToPurchased
    );

    const switchDirection = () => {
      if (conversionDirection === ConversionDirection.InventoryToPurchased) {
        setConversionDirection(ConversionDirection.PurchasedToInventory);
      } else {
        setConversionDirection(ConversionDirection.InventoryToPurchased);
      }
    };

    const unitOfMeasureOptions = useUnitOfMeasure();

    const description = useMemo(() => {
      const purchaseUnit =
        unitOfMeasureOptions.find((option) => option.value === purchasingCode)
          ?.label ??
        purchasingCode ??
        "";

      const inventoryUnit =
        unitOfMeasureOptions.find((option) => option.value === inventoryCode)
          ?.label ??
        inventoryCode ??
        "";

      const inverseOfConversion = 1 / conversionFactor;
      if (purchasingCode === inventoryCode) return `No conversion is required`;

      if (conversionDirection === ConversionDirection.InventoryToPurchased) {
        return `There ${conversionFactor === 1 ? "is" : "are"} ${twoDecimals(
          inverseOfConversion
        )} ${purchaseUnit.toLocaleLowerCase()} in one ${inventoryUnit.toLocaleLowerCase()}`;
      }

      return `There ${conversionFactor === 1 ? "is" : "are"} ${twoDecimals(
        conversionFactor
      )} ${inventoryUnit.toLocaleLowerCase()} in one ${purchaseUnit.toLocaleLowerCase()}`;
    }, [
      conversionDirection,
      conversionFactor,
      inventoryCode,
      purchasingCode,
      unitOfMeasureOptions,
    ]);

    const onPurchaseUnitChange = (value: number) => setConversionFactor(value);

    const onInventoryUnitChange = (value: number) =>
      setConversionFactor(1 / value);

    const onConfirm = () => {
      setControlValue(conversionFactor);
      setOpen(false);
      initialValue.current = conversionFactor;
    };

    const onCancel = () => {
      setConversionFactor(initialValue.current);
      setOpen(false);
    };

    return (
      <FormControl isInvalid={!!error} isRequired={isRequired}>
        {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
        <input type="hidden" {...getInputProps()} />
        <Modal
          open={open}
          onOpenChange={(open) => {
            if (!open) onCancel();
          }}
        >
          <CommandTrigger
            disabled={isReadOnly}
            icon={<MdTranslate className="w-4 h-4 opacity-50" />}
            ref={ref}
            onClick={() => setOpen(true)}
          >
            {controlValue ? twoDecimals(controlValue) : "-"}
          </CommandTrigger>

          <ModalContent>
            <ModalBody>
              <VStack spacing={8}>
                <VStack className="w-full text-center">
                  <div className="w-full text-lg">{description}</div>
                  <div className="w-full">
                    <Button
                      onClick={switchDirection}
                      variant="secondary"
                      size="sm"
                      className="border-dashed"
                    >
                      Switch
                    </Button>
                  </div>
                </VStack>
                {conversionDirection ===
                ConversionDirection.PurchasedToInventory ? (
                  <HStack className="w-full justify-around">
                    <VStack>
                      <NumberField
                        value={1 / conversionFactor}
                        onChange={onPurchaseUnitChange}
                      >
                        <NumberInputGroup className="relative">
                          <NumberInput />

                          <NumberInputStepper>
                            <NumberIncrementStepper>
                              <LuChevronUp size="1em" strokeWidth="3" />
                            </NumberIncrementStepper>
                            <NumberDecrementStepper>
                              <LuChevronDown size="1em" strokeWidth="3" />
                            </NumberDecrementStepper>
                          </NumberInputStepper>
                        </NumberInputGroup>
                      </NumberField>
                    </VStack>
                    <VStack className="w-auto">
                      <span className="font-mono text-xl">=</span>
                    </VStack>
                    <VStack>
                      <NumberField value={1}>
                        <NumberInputGroup className="relative">
                          <NumberInput isReadOnly />
                        </NumberInputGroup>
                      </NumberField>
                    </VStack>
                  </HStack>
                ) : (
                  <HStack className="w-full justify-around">
                    <VStack>
                      <NumberField value={1}>
                        <NumberInputGroup className="relative">
                          <NumberInput isReadOnly />
                        </NumberInputGroup>
                      </NumberField>
                    </VStack>
                    <VStack className="w-auto">
                      <span className="font-mono text-xl">=</span>
                    </VStack>
                    <VStack>
                      <NumberField
                        value={conversionFactor}
                        onChange={onInventoryUnitChange}
                      >
                        <NumberInputGroup className="relative">
                          <NumberInput />

                          <NumberInputStepper>
                            <NumberIncrementStepper>
                              <LuChevronUp size="1em" strokeWidth="3" />
                            </NumberIncrementStepper>
                            <NumberDecrementStepper>
                              <LuChevronDown size="1em" strokeWidth="3" />
                            </NumberDecrementStepper>
                          </NumberInputStepper>
                        </NumberInputGroup>
                      </NumberField>
                    </VStack>
                  </HStack>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={onConfirm}>Confirm</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
    );
  }
);
ConversionFactor.displayName = "ConversionFactor";

export default ConversionFactor;
