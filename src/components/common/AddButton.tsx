import { UserPlus } from "lucide-react";
import Button from "@/components/ui/button";

interface AddStaffButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function AddButton({
  label,
  onClick,
  disabled,
}: AddStaffButtonProps) {
  return (
    <Button
      type="button"
      variant="gradient"
      size="sm"
      className="gap-2 shadow-sm px-8 font-bold"
      onClick={onClick}
      disabled={disabled}
    >
      <UserPlus size={16} aria-hidden />
      {label}
    </Button>
  );
}
