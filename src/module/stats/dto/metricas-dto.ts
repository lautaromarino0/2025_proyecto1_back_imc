export interface IMetricasDTO {
  promedioImc: number;
  variacionImc: number;
  promedioPeso: number;
  variacionPeso: number;
  conteoCategorias: Record<string, number>;
}
