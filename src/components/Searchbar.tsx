import { Search, SearchIcon, X } from "lucide-react";
import { useState, useEffect } from "react";

interface SearchBarProps {
  value?: string;
  onChange?: (val: string) => void;
  onSubmit?: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Search...",
  className = "",
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange?.(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    onChange?.("");
    onSubmit?.("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center min-w-[240px] max-w-md flex-1 ${className}`}
    >
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none flex items-center justify-center">
        <SearchIcon className="size-4" />
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        className="input input-sm w-full pl-9 pr-8 bg-base-100 border border-base-300 rounded-lg text-sm placeholder:text-base-content/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
      />

      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content p-0.5 rounded-full hover:bg-base-200 transition-colors"
          title="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </form>
  );
}
