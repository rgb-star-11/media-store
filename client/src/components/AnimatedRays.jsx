import React, { useEffect, useState } from "react";

export default function AnimatedRays({ className = "", children }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // نورها را کمی پررنگ‌تر کردم تا واضح‌تر دیده شوند
    const stripeColor = "rgba(255, 255, 255, 0.15)";
    const stripes = `repeating-linear-gradient(
        100deg,
        ${stripeColor} 0%,
        ${stripeColor} 7%,
        transparent 10%,
        transparent 12%,
        ${stripeColor} 16%
    )`;
    
    const rainbow = `repeating-linear-gradient(
        100deg,
        #60a5fa 10%,
        #e879f9 15%,
        #60a5fa 20%,
        #5eead4 25%,
        #60a5fa 30%
    )`;

    return (
        <>
            {/* تزریق اجباری و استاندارد انیمیشن در ری‌اکت */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes aurora-motion {
                    0% { background-position: 50% 50%, 50% 50%; }
                    100% { background-position: 350% 50%, 350% 50%; }
                }
                .running-aurora {
                    animation: aurora-motion 20s linear infinite;
                }
                `
            }} />

            <section className={`relative w-full h-full overflow-hidden ${className}`}>
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `${stripes}, ${rainbow}`,
                        backgroundSize: "300%, 200%",
                        backgroundPosition: "50% 50%, 50% 50%",
                        filter: "blur(10px) opacity(70%) saturate(200%)",
                        maskImage: "radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%)",
                        WebkitMaskImage: "radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%)",
                    }}
                >
                    <div
                        className="absolute inset-0 running-aurora"
                        style={{
                            backgroundImage: `${stripes}, ${rainbow}`,
                            backgroundSize: "200%, 100%",
                            /* ویژگی fixed در اینجا حذف شد تا کروم جلوی حرکت را نگیرد */
                            mixBlendMode: "difference",
                        }}
                    />
                </div>

                {children && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                        {children}
                    </div>
                )}
            </section>
        </>
    );
}