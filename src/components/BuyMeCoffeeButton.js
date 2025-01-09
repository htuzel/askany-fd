export default function BuyMeCoffeeButton({ className = '' }) {
  return (
    <a
      href="https://buymeacoffee.com/htuzel"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2 bg-[#FFDD00] text-[#000000] rounded-lg hover:bg-[#FFDD00]/90 transition-colors ${className}`}
    >
      <img
        src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
        alt="Buy me a coffee"
        className="h-6 w-6"
      />
      <span className="font-semibold">Buy me a coffee</span>
    </a>
  );
} 