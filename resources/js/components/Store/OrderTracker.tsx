import { Check, Package, Truck, CheckCircle, XCircle } from 'lucide-react';

interface OrderTrackerProps {
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export default function OrderTracker({ status }: OrderTrackerProps) {
    const steps = [
        { key: 'pending', label: 'Order Placed', icon: Package },
        { key: 'processing', label: 'Processing', icon: Package },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    const statusIndex = steps.findIndex((step) => step.key === status);
    const isCancelled = status === 'cancelled';

    if (isCancelled) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-red-100 p-3">
                        <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <p className="font-serif text-lg font-medium text-red-900">
                            Order Cancelled
                        </p>
                        <p className="mt-1 text-sm text-red-700">
                            This order has been cancelled
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-[#171310]/10 bg-[#F8F5EF] p-8">
            <h3 className="mb-6 font-serif text-lg font-medium text-[#171310]">
                Order Tracking
            </h3>

            <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-6 top-6 h-full w-0.5 bg-[#171310]/10">
                    <div
                        className="h-full w-full bg-[#9C7A3C] transition-all duration-500"
                        style={{
                            height: statusIndex >= 0 ? `${(statusIndex / (steps.length - 1)) * 100}%` : '0%',
                        }}
                    />
                </div>

                {/* Steps */}
                <div className="relative space-y-8">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isComplete = index <= statusIndex;
                        const isCurrent = index === statusIndex;

                        return (
                            <div key={step.key} className="flex items-start gap-4">
                                {/* Step Circle */}
                                <div
                                    className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                        isComplete
                                            ? 'border-[#9C7A3C] bg-[#9C7A3C]'
                                            : 'border-[#171310]/20 bg-white'
                                    }`}
                                >
                                    {isComplete ? (
                                        isCurrent && index < steps.length - 1 ? (
                                            <Icon className="h-5 w-5 text-white" />
                                        ) : (
                                            <Check className="h-5 w-5 text-white" />
                                        )
                                    ) : (
                                        <Icon className="h-5 w-5 text-[#171310]/30" />
                                    )}
                                </div>

                                {/* Step Content */}
                                <div className="flex-1 pt-2">
                                    <p
                                        className={`font-medium ${
                                            isComplete ? 'text-[#171310]' : 'text-[#252525]/40'
                                        }`}
                                    >
                                        {step.label}
                                    </p>
                                    {isCurrent && (
                                        <p className="mt-1 text-sm text-[#9C7A3C]">
                                            Current Status
                                        </p>
                                    )}
                                    {isComplete && !isCurrent && (
                                        <p className="mt-1 text-xs text-[#252525]/50">
                                            Completed
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
