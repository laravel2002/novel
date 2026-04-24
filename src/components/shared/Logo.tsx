import { IconBook2 } from "@tabler/icons-react";

export function Logo() {
  return (
    <div className="flex items-center font-heading font-black text-2xl tracking-tight group">
      <div className="relative flex items-center justify-center w-8 h-8 mr-2.5 rounded-xl bg-gradient-to-br from-primary to-orange-500 shadow-sm shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300">
        <IconBook2 className="h-5 w-5 text-primary-foreground absolute z-10" />
        <div className="absolute inset-0 bg-white/20 rounded-xl group-hover:opacity-0 transition-opacity" />
      </div>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 group-hover:to-primary transition-all duration-300">
        Novel
      </span>
    </div>
  );
}
