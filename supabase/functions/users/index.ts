interface CreateUserRequest {
  email: string;
  role: 'client' | 'fournisseur';
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const action = pathParts[pathParts.length - 1];

    // GET /users - Get all users (clients and fournisseurs)
    if (req.method === "GET" && action === "users") {
      // Fetch clients
      const clientsResponse = await fetch(
        `${supabaseUrl}/rest/v1/client?select=id,email,created_at`,
        {
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "apikey": supabaseServiceKey,
          },
        }
      );

      // Fetch fournisseurs
      const fournisseursResponse = await fetch(
        `${supabaseUrl}/rest/v1/fournisseurs?select=id,email,created_at`,
        {
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "apikey": supabaseServiceKey,
          },
        }
      );

      if (!clientsResponse.ok || !fournisseursResponse.ok) {
        throw new Error("Failed to fetch users");
      }

      const clients = await clientsResponse.json();
      const fournisseurs = await fournisseursResponse.json();

      // Combine and add role information
      const allUsers = [
        ...clients.map((user: any) => ({ ...user, role: 'client' })),
        ...fournisseurs.map((user: any) => ({ ...user, role: 'fournisseur' }))
      ];

      return new Response(
        JSON.stringify({ success: true, data: allUsers }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // GET /fournisseurs - Get all fournisseurs for assignment
    if (req.method === "GET" && action === "fournisseurs") {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/fournisseurs?select=id,email`,
        {
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "apikey": supabaseServiceKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch fournisseurs");
      }

      const fournisseurs = await response.json();
      return new Response(
        JSON.stringify({ success: true, data: fournisseurs }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // GET /clients - Get all clients for admin complaint creation
    if (req.method === "GET" && action === "clients") {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/client?select=id,email`,
        {
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "apikey": supabaseServiceKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }

      const clients = await response.json();
      return new Response(
        JSON.stringify({ success: true, data: clients }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // GET /admins - Get all admins
    if (req.method === "GET" && action === "admins") {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/admin?select=id,email,created_at`,
        {
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "apikey": supabaseServiceKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch admins");
      }

      const admins = await response.json();
      return new Response(
        JSON.stringify({ success: true, data: admins }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // POST /admins - Create new admin
    if (req.method === "POST" && action === "admins") {
      const { email } = await req.json();

      if (!email) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing email" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/admin`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "apikey": supabaseServiceKey,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          email,
          password: 'password', // Default password
          first_login: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: errorData.message || "Failed to create admin" 
          }),
          {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const admin = await response.json();
      return new Response(
        JSON.stringify({ success: true, data: admin[0] }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // POST /users - Create new user
    if (req.method === "POST" && action === "users") {
      const { email, role }: CreateUserRequest = await req.json();

      if (!email || !role) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const tableName = role === 'client' ? 'client' : 'fournisseurs';

      const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "apikey": supabaseServiceKey,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          email,
          password: 'password', // Default password
          first_login: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: errorData.message || "Failed to create user" 
          }),
          {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const user = await response.json();
      return new Response(
        JSON.stringify({ success: true, data: { ...user[0], role } }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // DELETE /users/:id/:role - Delete user
    if (req.method === "DELETE") {
      const userId = pathParts[pathParts.length - 2];
      const userRole = pathParts[pathParts.length - 1];

      // Handle admin deletion (different URL pattern)
      if (pathParts[pathParts.length - 2] === "admins") {
        const adminId = pathParts[pathParts.length - 1];
        
        const response = await fetch(`${supabaseUrl}/rest/v1/admin?id=eq.${adminId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${supabaseServiceKey}`,
            "apikey": supabaseServiceKey,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete admin");
        }

        return new Response(
          JSON.stringify({ success: true, message: "Admin deleted successfully" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!userId || !userRole || userRole === "admins") {
        return new Response(
          JSON.stringify({ success: false, message: "Missing user ID or role" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const tableName = userRole === 'client' ? 'client' : 'fournisseurs';

      const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?id=eq.${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "apikey": supabaseServiceKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      return new Response(
        JSON.stringify({ success: true, message: "User deleted successfully" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Users API error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});