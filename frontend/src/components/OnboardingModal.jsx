import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { MapPin, Camera, Calendar, BarChart3, UserCheck, Star, MessageSquare, RefreshCw, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const stepIcons = [MapPin, Camera, Calendar, BarChart3, UserCheck, Star, MessageSquare, RefreshCw];

const OnboardingModal = ({ role, onClose }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);

  const roleKey = role === "encargado" ? "encargado" : role === "prestador" ? "prestador" : "tourist";
  const data = t(`onboarding.${roleKey}`);

  if (!data || typeof data === "string") return null;

  const steps = data.steps || [];
  const isLastStep = step >= steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" data-testid="onboarding-modal">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-[#1B5E20] to-[#0D3311] px-8 pt-8 pb-12 relative overflow-hidden">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            data-testid="onboarding-close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute top-6 -left-4 w-20 h-20 bg-white/5 rounded-full" />
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display' }}>
            {data.title}
          </h2>
          <p className="text-white/80 text-sm">{data.subtitle}</p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 -mt-4 relative z-10">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === step ? "bg-[#1B5E20] scale-125" : i < step ? "bg-[#1B5E20]/40" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="px-8 py-8">
          {steps[step] && (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1B5E20]/10 rounded-2xl mx-auto mb-5 flex items-center justify-center">
                {(() => {
                  const Icon = stepIcons[step % stepIcons.length];
                  return <Icon className="w-8 h-8 text-[#1B5E20]" />;
                })()}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{steps[step].title}</h3>
              <p className="text-gray-600 leading-relaxed">{steps[step].desc}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="onboarding-skip"
          >
            {t("onboarding.skip")}
          </button>
          <Button
            onClick={() => isLastStep ? onClose() : setStep(s => s + 1)}
            className="bg-[#1B5E20] hover:bg-[#145218] px-6"
            data-testid="onboarding-next"
          >
            {isLastStep ? t("onboarding.done") : t("onboarding.next")}
            {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
