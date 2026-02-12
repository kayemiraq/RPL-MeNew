export default function MenuIndex() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-menew-offwhite px-4">
            <div className="text-center max-w-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-menew-terracotta to-menew-camel rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <span className="text-white font-bold text-3xl">M</span>
                </div>
                <h1 className="text-2xl font-bold text-menew-navy mb-2">MeNew</h1>
                <p className="text-menew-slate text-sm mb-6">
                    Scan QR Code di meja Anda untuk melihat menu dan langsung pesan.
                </p>
                <div className="bg-menew-cream/50 rounded-2xl p-5 border border-menew-cream">
                    <p className="text-xs text-menew-navy font-medium">Format URL:</p>
                    <code className="text-menew-terracotta text-sm font-mono mt-1 block">
                        /menu/&#123;store-slug&#125;/T&#123;number&#125;
                    </code>
                </div>
            </div>
        </div>
    );
}
