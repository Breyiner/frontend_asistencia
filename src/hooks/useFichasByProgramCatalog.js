import { useMemo } from "react";
import useCatalog from "./useCatalog";

export function useFichasByProgramCatalog(trainingProgramId) {
  const key = useMemo(() => {
    return trainingProgramId
      ? `fichas/training_program/${trainingProgramId}`
      : "fichas";
  }, [trainingProgramId]);

  return useCatalog(key);
}
