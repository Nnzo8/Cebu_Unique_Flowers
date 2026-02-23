import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminNavbarComponent } from '../../../shared/components/admin-navbar.component/admin-navbar.component';
import { ProductService, Product } from '../../../core/services/product.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminNavbarComponent],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inventory {
  private formBuilder = inject(FormBuilder);
  private productService = inject(ProductService);

  // State: Products list
  readonly products = signal<Product[]>([]);

  // State: Form visibility
  readonly isFormOpen = signal(false);

  // State: Currently selected product (null = create mode)
  readonly selectedProduct = signal<Product | null>(null);

  // State: Loading state
  readonly isLoading = signal(false);

  // Form
  productForm: FormGroup;

  // Computed: Is form in edit mode?
  readonly isEditMode = computed(() => this.selectedProduct() !== null);

  // Computed: Form title
  readonly formTitle = computed(() =>
    this.isEditMode() ? 'Edit Product' : 'Add New Product'
  );

  constructor() {
    this.productForm = this.initializeForm();
    this.loadProducts();
  }

  /**
   * Initialize reactive form
   */
  private initializeForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    });
  }

  /**
   * Load products from API
   */
  private loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load products:', error);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Open form for creating new product
   */
  openCreateForm(): void {
    this.selectedProduct.set(null);
    this.productForm.reset();
    this.isFormOpen.set(true);
  }

  /**
   * Open form for editing existing product
   */
  editProduct(product: Product): void {
    this.selectedProduct.set(product);
    this.productForm.patchValue({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
    });
    this.isFormOpen.set(true);
  }

  /**
   * Close form and reset
   */
  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedProduct.set(null);
    this.productForm.reset();
  }

  /**
   * Save product (create or update)
   */
  saveProduct(): void {
    if (this.productForm.invalid) {
      return;
    }

    this.isLoading.set(true);

    const formValue = this.productForm.value;
    const selected = this.selectedProduct();

    if (selected) {
      // Update existing product
      this.productService.updateProduct(selected.id, {
        name: formValue.name,
        price: formValue.price,
        category: formValue.category,
        description: formValue.description,
        imageUrl: formValue.imageUrl,
      }).subscribe({
        next: (updatedProduct) => {
          console.log('Product updated:', updatedProduct);
          this.products.update(products =>
            products.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
          );
          this.isLoading.set(false);
          this.closeForm();
        },
        error: (error) => {
          console.error('Failed to update product:', error);
          this.isLoading.set(false);
        },
      });
    } else {
      // Create new product
      this.productService.createProduct({
        name: formValue.name,
        price: formValue.price,
        category: formValue.category,
        description: formValue.description,
        imageUrl: formValue.imageUrl,
      }).subscribe({
        next: (newProduct) => {
          console.log('Product created:', newProduct);
          this.products.update(products => [newProduct, ...products]);
          this.isLoading.set(false);
          this.closeForm();
        },
        error: (error) => {
          console.error('Failed to create product:', error);
          this.isLoading.set(false);
        },
      });
    }
  }

  /**
   * Delete product with confirmation
   */
  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          console.log('Product deleted:', product.id);
          this.products.update(products => products.filter(p => p.id !== product.id));
        },
        error: (error) => {
          console.error('Failed to delete product:', error);
        },
      });
    }
  }
}
