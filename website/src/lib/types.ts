export type RoleName = "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";

export type MeUser = {
  id: string;
  email: string;
  status?: string;
  displayName?: string | null;
  bio?: string | null;
  location?: string | null;
  roles: RoleName[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  attributes: {
    id: string;
    key: string;
    label: string;
    valueType: string;
    required: boolean;
  }[];
};

export type Listing = {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  askingPrice: string;
  currency: string;
  location?: string | null;
  status: string;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  category: { id: string; name: string; slug: string };
  seller: { id: string; profile?: { displayName: string } | null };
  images: { url: string }[];
  fees: { label: string; amount: string; currency: string }[];
  terms: { content: string }[];
};
