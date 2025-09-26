'use client';

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  // Obtener iniciales del email
  const getUserInitials = (email?: string) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center" onClick={() => router.push('/dashboard')}>
          {/* Logo para tema claro */}
          <Image
           src="/logo-agrobeat-light.png"
            alt="AgroBeat"
            width={120}
            height={32}
            className="h-8 w-auto dark:hidden"
            unoptimized 
          />
          {/* Logo para tema oscuro */}
          <Image
             src="/logo-agrobeat-light.png"
            alt="AgroBeat"
            width={120}
            height={32}
            className="hidden h-8 w-auto dark:block"
            unoptimized 
          />
        </div>

        {/* Usuario y Logout */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getUserInitials(userEmail)}
              </AvatarFallback>
            </Avatar>
            {userEmail && (
              <span className="hidden text-sm text-muted-foreground sm:block">
                {userEmail}
              </span>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:block">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
