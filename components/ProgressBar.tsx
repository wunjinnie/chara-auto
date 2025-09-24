import React from 'react';
import { AppStep } from '../types';

interface ProgressBarProps {
  currentStep: AppStep;
}

const steps = [
  { id: AppStep.CHARACTER_SHEET, name: 'Character Roster' },
  { id: AppStep.CONCEPT, name: 'Concept' },
  { id: AppStep.SCENES, name: 'Scenes' },
];

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
    return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <li key={step.name} className="md:flex-1">
              <div
                className={`group flex flex-col border-l-4 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                  isCompleted ? 'border-purple-600' : isCurrent ? 'border-cyan-500' : 'border-slate-700'
                }`}
              >
                <span className={`text-sm font-medium transition-colors ${
                    isCompleted ? 'text-purple-400' : isCurrent ? 'text-cyan-400' : 'text-slate-500'
                }`}>Step {index + 1}</span>
                <span className="text-sm font-medium text-slate-300">{step.name}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ProgressBar;
