import { Component, ChangeDetectionStrategy, signal, computed, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../core/services/product.service';
import { NavbarComponent } from '../../../shared/components/navbar.component/navbar.component';

type CategoryType = 'All' | 'Anniversary' | 'Birthdays' | 'Sympathy' | 'Weddings';

@Component({
  selector: 'app-catalog',
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catalog implements OnInit {
  private readonly productService = inject(ProductService);
  // State: All products from API
  readonly products = signal<Product[]>([]);

  // State: Loading indicator
  readonly loading = signal(false);

  // State: Error message
  readonly error = signal<string | null>(null);

  // State: Selected category filter
  readonly selectedCategory = signal<CategoryType>('All');

  // Category options
  readonly categories: CategoryType[] = ['All', 'Anniversary', 'Birthdays', 'Sympathy', 'Weddings'];

  // ====== API TESTING STATE ======
  // Toggle testing panel
  readonly showTestPanel = signal(false);

  // Test GET single product
  readonly testGetId = signal('');
  readonly testGetResult = signal<Product | null>(null);
  readonly testGetLoading = signal(false);

  // Test POST (create)
  readonly testCreateName = signal('Test Rose');
  readonly testCreatePrice = signal(99);
  readonly testCreateCategory = signal('Weddings');
  readonly testCreateResult = signal<Product | null>(null);
  readonly testCreateLoading = signal(false);

  // Test PUT (update)
  readonly testUpdateId = signal('');
  readonly testUpdateName = signal('Updated Rose');
  readonly testUpdatePrice = signal(150);
  readonly testUpdateResult = signal<Product | null>(null);
  readonly testUpdateLoading = signal(false);

  // Test DELETE
  readonly testDeleteId = signal('');
  readonly testDeleteLoading = signal(false);
  readonly testDeleteMessage = signal('');

  // Computed: Filtered products based on selected category
  readonly filteredProducts = computed(() => {
    const selected = this.selectedCategory();
    if (selected === 'All') {
      return this.products();
    }
    return this.products().filter((product) => product.category === selected);
  });

  constructor() {
    // Automatically retry API call when error changes (user clicks retry)
    effect(() => {
      if (this.error() !== null) {
        // Error is set, user can manually trigger retry
      }
    });
  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  /**
   * Fetch products from API and sync with signals
   */
  private fetchProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load products');
        this.loading.set(false);
        console.error('Product fetch error:', err);
      },
    });
  }

  /**
   * Retry fetching products (user-triggered)
   */
  retryFetch(): void {
    this.fetchProducts();
  }

  /**
   * Update selected category
   */
  selectCategory(category: CategoryType): void {
    this.selectedCategory.set(category);
  }

  /**
   * Handle add to cart (placeholder for future cart service integration)
   */
  addToCart(product: Product): void {
    console.log('Added to cart:', product.name);
    // Future: Integrate with cart service signal
    // this.cartService.addItem(product);
  }

  /**
   * Add new product to catalog (Admin only)
   * Creates a new product and refreshes the product list
   * @param product - Product data to create
   */
  createNewProduct(product: Partial<Product>): void {
    this.productService.createProduct(product).subscribe({
      next: (newProduct) => {
        console.log('Product created:', newProduct);
        // Refresh the product list to show the new item
        this.fetchProducts();
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to create product');
        console.error('Create product error:', err);
      },
    });
  }

  /**
   * Update an existing product (Admin only)
   * Modifies product and refreshes the product list
   * @param id - Product ID to update
   * @param updates - Partial product data to update
   */
  updateExistingProduct(id: string, updates: Partial<Product>): void {
    this.productService.updateProduct(id, updates).subscribe({
      next: (updatedProduct) => {
        console.log('Product updated:', updatedProduct);
        // Refresh the product list to show the updated item
        this.fetchProducts();
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to update product');
        console.error('Update product error:', err);
      },
    });
  }

  /**
   * Delete a product from catalog (Admin only)
   * Removes product and refreshes the product list
   * @param id - Product ID to delete
   */
  removeProduct(id: string): void {
    // Confirm deletion with user before proceeding
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        console.log('Product deleted:', id);
        // Refresh the product list to remove the deleted item
        this.fetchProducts();
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to delete product');
        console.error('Delete product error:', err);
      },
    });
  }

  /**
   * Fetch single product by ID for detail view
   * @param id - Product ID to fetch
   */
  loadProductDetail(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        console.log('Product loaded:', product);
        // Handle single product display (store in a separate signal if needed)
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load product');
        this.loading.set(false);
        console.error('Get product error:', err);
      },
    });
  }

  // ====== API TESTING METHODS ======

  /**
   * TEST: GET single product by ID
   */
  testGetProduct(): void {
    const id = this.testGetId();
    if (!id) {
      alert('Please enter a product ID');
      return;
    }

    this.testGetLoading.set(true);
    this.testGetResult.set(null);

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        console.log('✅ GET Product Success:', product);
        this.testGetResult.set(product);
        this.testGetLoading.set(false);
      },
      error: (err) => {
        console.error('❌ GET Product Failed:', err);
        alert(`GET Failed: ${err.message}`);
        this.testGetLoading.set(false);
      },
    });
  }

  /**
   * TEST: POST - Create new product
   */
  testCreateProduct(): void {
    const newProduct: Partial<Product> = {
      name: this.testCreateName(),
      price: this.testCreatePrice(),
      category: this.testCreateCategory(),
      imageUrl: 'https://via.placeholder.com/300',
    };

    this.testCreateLoading.set(true);
    this.testCreateResult.set(null);

    this.productService.createProduct(newProduct).subscribe({
      next: (createdProduct) => {
        console.log('✅ POST Product Success:', createdProduct);
        this.testCreateResult.set(createdProduct as Product);
        this.testCreateLoading.set(false);
      },
      error: (err) => {
        console.error('❌ POST Product Failed:', err);
        alert(`POST Failed: ${err.message}`);
        this.testCreateLoading.set(false);
      },
    });
  }

  /**
   * TEST: PUT - Update product
   */
  testUpdateProduct(): void {
    const id = this.testUpdateId();
    if (!id) {
      alert('Please enter a product ID to update');
      return;
    }

    const updates: Partial<Product> = {
      name: this.testUpdateName(),
      price: this.testUpdatePrice(),
    };

    this.testUpdateLoading.set(true);
    this.testUpdateResult.set(null);

    this.productService.updateProduct(id, updates).subscribe({
      next: (updatedProduct) => {
        console.log('✅ PUT Product Success:', updatedProduct);
        this.testUpdateResult.set(updatedProduct as Product);
        this.testUpdateLoading.set(false);
      },
      error: (err) => {
        console.error('❌ PUT Product Failed:', err);
        alert(`PUT Failed: ${err.message}`);
        this.testUpdateLoading.set(false);
      },
    });
  }

  /**
   * TEST: DELETE product
   */
  testDeleteProduct(): void {
    const id = this.testDeleteId();
    if (!id) {
      alert('Please enter a product ID to delete');
      return;
    }

    if (!confirm(`Delete product ${id}?`)) {
      return;
    }

    this.testDeleteLoading.set(true);
    this.testDeleteMessage.set('');

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        console.log('✅ DELETE Product Success:', id);
        this.testDeleteMessage.set(`✅ Successfully deleted product ${id}`);
        this.testDeleteLoading.set(false);
      },
      error: (err) => {
        console.error('❌ DELETE Product Failed:', err);
        this.testDeleteMessage.set(`❌ Failed to delete: ${err.message}`);
        this.testDeleteLoading.set(false);
      },
    });
  }
}
