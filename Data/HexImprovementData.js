import { hexImprovementType } from './Types/HexImprovementType.js';

export const hexImprovementData = {
    [hexImprovementType.NONE]: {price: 0, modifier: 1},
    [hexImprovementType.HOME]: {price: 0, modifier: 1},
    [hexImprovementType.FARM]: {price: 3, modifier: 2},
    [hexImprovementType.MARKET]: {price: 9, modifier: 3},
    [hexImprovementType.BANK]: {price: 12, modifier: 4},
    [hexImprovementType.HIGHRISE]: {price: 15, modifier: 5},
    [hexImprovementType.TOWER]: {price: 15, modifier: 0},
}