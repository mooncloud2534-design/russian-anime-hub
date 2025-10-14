import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Shield } from "lucide-react";
import { toast } from "sonner";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdminRole(session.user.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Вы вышли из системы");
    navigate("/");
  };

  return (
    <nav className="border-b border-primary/20 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold glow-text">Anime Dom Pro</h1>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin")}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Админ панель
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-primary/30 hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Войти
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
