import React from "react";
import { Step1, Step2, Step3, Step4 } from "@/pages/MedicalRecord";
import UseFormStore from "@/store/UseFormStore";

export function AddPatientData() {
  const { currentStep } = UseFormStore();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      default:
        return <Step4 />;
    }
  };
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Add Patient Data</h1>
      <div className="card p-4 bg-white shadow-md pb-8">
        <ul className="steps z-0 text-xs">
          <li className={`step ${1 <= currentStep && "step-primary"}`}>
            Data Pasien
          </li>
          <li className={`step ${2 <= currentStep && "step-primary"}`}>
            Ukuran Lama
          </li>
          <li className={`step ${3 <= currentStep && "step-primary"}`}>
            Ukuran Baru
          </li>
          <li className={`step ${4 <= currentStep && "step-primary"}`}>
            Ringkasan
          </li>
        </ul>
        {renderStep()}
      </div>
    </div>
  );
}

export default AddPatientData;
