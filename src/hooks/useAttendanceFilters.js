import { useState } from "react";
import useCatalog from "./useCatalog";

export function useAttendanceFilters() {
  const [preset, setPreset] = useState("7d"); // 7d | month | 30d | custom
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [trainingProgramId, setTrainingProgramId] = useState("");
  const [fichaId, setFichaId] = useState("");

  const programsCatalog = useCatalog("training_programs/select");

  const reset = () => {
    setPreset("7d");
    setFrom("");
    setTo("");
    setTrainingProgramId("");
    setFichaId("");
  };

  return {
    preset,
    setPreset,
    from,
    setFrom,
    to,
    setTo,
    trainingProgramId,
    setTrainingProgramId,
    fichaId,
    setFichaId,
    reset,
    programsCatalog,
  };
}
