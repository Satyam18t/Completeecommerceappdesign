import { User, LogOut, LayoutDashboard, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

interface AccountMenuProps {
  userName: string | undefined;
  userEmail: string | undefined;
  onLogout: () => void;
  onViewDashboard: () => void;
  onViewOrders: () => void;
  onViewProfile: () => void;
}

export function AccountMenu({ 
  userName, 
  userEmail, 
  onLogout,
  onViewDashboard,
  onViewOrders,
  onViewProfile
}: AccountMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <User className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-0">
        <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <p className="font-medium">My Account</p>
        </div>
        <div className="p-2">
          <DropdownMenuItem 
            className="cursor-pointer py-3 px-3 rounded-md"
            onClick={onViewDashboard}
          >
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer py-3 px-3 rounded-md"
            onClick={onViewOrders}
          >
            <Package className="w-4 h-4 mr-3" />
            Orders
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer py-3 px-3 rounded-md"
            onClick={onViewProfile}
          >
            <User className="w-4 h-4 mr-3" />
            Profile
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="my-0" />
        <div className="p-2">
          <DropdownMenuItem 
            onClick={onLogout} 
            className="cursor-pointer py-3 px-3 rounded-md text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
