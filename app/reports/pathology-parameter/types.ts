export interface ReferenceRange {
  gender: 'MALE' | 'FEMALE' | 'BOTH';
  ageMin: number;
  ageMax: number;
  minValue: number;
  maxValue: number;
  unit: string;
}

export interface Parameter {
  id: number;
  name: string;
  nabl: string;
  specimenType: string;
  method: string;
  unit: string;
  type: string;
  priority: string;
  isRequired: string;
  validation: string;
  left: string;
  bottom: string;
  top: string;
  interface1: string;
  interface2: string;
  calc: string;
  paramCode: string;
}

export interface PathologyParam {
  id: number;
  parameterName: string;
  unit: string;
  criticalLow: number;
  criticalHigh: number;
  isCalculated: boolean;
  resultType: 'NUMERIC' | 'TEXT' | 'QUALITATIVE' | 'SEMI_QUANTITATIVE' | 'STRUCTURED';
  branchId: number;
  referenceRanges: ReferenceRange[];
  parameters?: Parameter[];
}
