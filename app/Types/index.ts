export interface User {
  id: number
  name: string
  email: string
  phone_number?: string
  house_number?: string
  street?: string
  city?: string
  location?: string
  country?: string
  role: string
  zim_contact: string
  created_at: string
  updated_at: string
  zim_name: string
}

export interface Category {
  id: number
  name: string
  description?: string
  image_url: string
  type: string
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: number
  product_id: number
  image_url: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock_quantity: number
  category_id: number
  image_url?: string
  weight?: string
  dimensions?: string
  is_featured?: boolean
  created_at: string
  updated_at: string
  category?: Category
  productImages?: ProductImage[]
}

export interface OrderItem {
  id: number
  order_id: number
  product_id?: number | null
  hamper_id?: number | null
  quantity: number
  price: number
  created_at: string
  updated_at: string
  product?: Product
  hamper?: Hamper
  type?: "product" | "hamper"
}

export interface Payment {
  id: number
  order_id: number
  payment_method: string
  amount: number
  status: string
  transaction_id?: string
  created_at: string
  updated_at: string
}

export interface ProductInfo {
  product: Product
  quantity: number
  price: number
}

export interface HamperInfo {
  hamper: Hamper
  quantity: number
  price: number
}

export interface Order {
  id: number
  user_id: number
  total_amount: number
  status: string
  created_at: string
  shipping_address?: string
  zim_contact?: string
  zim_name?: string
  shipping_cost: number
  updated_at: string
  user: User
  orderItems: OrderItem[]
  payment?: Payment
  products?: ProductInfo[]
  hampers?: HamperInfo[]
  product_names?: string[]
  product_quantities?: number[]
  product_prices?: number[]
  hamper_names?: string[]
  hamper_quantities?: number[]
  hamper_prices?: number[]
  expires_at?: string
  delivery_zone?: number
}

export interface Hamper {
  id: number
  name: string
  description: string
  price: number
  stock_quantity: number
  image_url?: string
  is_active: boolean
  hamper_items?: HamperItem[]
  products?: HamperProduct[]
  created_at?: string
  updated_at?: string
  user_id?: string
  is_custom?: boolean
  category_id?: string
  category?: Category
}

export interface HamperItem {
  id: number
  hamper_id: number
  product_id: number
  quantity: number
  product?: Product
}

export interface HamperProduct {
  id: number
  name: string
  description: string
  price: number
  stock_quantity: number
  image_url?: string
  category_id: number
  category?: Category
  pivot: {
    quantity: number
  }
  created_at: string
  updated_at: string
}

export interface CartItem {
  product: Product | Hamper
  quantity: number
  type: "product" | "hamper"
}

