import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Product interface - Firebase-ready structure
 */
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description?: string;
}

type CategoryType = 'All' | 'Anniversary' | 'Birthdays' | 'Sympathy' | 'Weddings';

@Component({
  selector: 'app-catalog',
  imports: [CommonModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catalog {
  // State: All products (will be replaced by Firestore observable)
  readonly products = signal<Product[]>([
    {
      id: '1',
      name: 'Romantic Blush',
      price: 85,
      imageUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&h=500&fit=crop',
      category: 'Anniversary',
      description: 'A stunning arrangement of blush roses and white lilies',
    },
    {
      id: '2',
      name: 'Sunny Delight',
      price: 65,
      imageUrl: 'https://images.unsplash.com/photo-1599599810694-b5ac2dd65d4a?w=500&h=500&fit=crop',
      category: 'Birthdays',
      description: 'Bright sunflowers and yellow daisies',
    },
    {
      id: '3',
      name: 'Elegant Sympathy',
      price: 75,
      imageUrl: 'https://images.unsplash.com/photo-1562181286-d3fee7d55364?w=500&h=500&fit=crop',
      category: 'Sympathy',
      description: 'A peaceful arrangement of white and cream flowers',
    },
    {
      id: '4',
      name: 'Garden Paradise',
      price: 95,
      imageUrl: 'https://images.unsplash.com/photo-1563241527-3004a75c7452?w=500&h=500&fit=crop',
      category: 'Weddings',
      description: 'Mixed garden flowers in soft pastels',
    },
    {
      id: '5',
      name: 'Anniversary Red',
      price: 88,
      imageUrl: 'https://images.unsplash.com/photo-1585007137886-21e96d5f2fae?w=500&h=500&fit=crop',
      category: 'Anniversary',
      description: 'Deep red roses with white baby\'s breath',
    },
    {
      id: '6',
      name: 'Birthday Tropical',
      price: 72,
      imageUrl: 'https://images.unsplash.com/photo-1590080876343-143d67dc6872?w=500&h=500&fit=crop',
      category: 'Birthdays',
      description: 'Vibrant tropical flowers arrangement',
    },
    {
      id: '7',
      name: 'Lavender Dreams',
      price: 80,
      imageUrl: 'https://images.unsplash.com/photo-1577720643272-265f434881fd?w=500&h=500&fit=crop',
      category: 'Sympathy',
      description: 'Calming lavender and white flower mix',
    },
    {
      id: '8',
      name: 'Bride\'s Choice',
      price: 120,
      imageUrl: 'https://images.unsplash.com/photo-1553882900-f2b06423ff1d?w=500&h=500&fit=crop',
      category: 'Weddings',
      description: 'Premium white and pale pink wedding bouquet',
    },
  ]);

  // State: Selected category filter
  readonly selectedCategory = signal<CategoryType>('All');

  // Category options
  readonly categories: CategoryType[] = ['All', 'Anniversary', 'Birthdays', 'Sympathy', 'Weddings'];

  // Computed: Filtered products based on selected category
  readonly filteredProducts = computed(() => {
    const selected = this.selectedCategory();
    if (selected === 'All') {
      return this.products();
    }
    return this.products().filter((product) => product.category === selected);
  });

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
}
