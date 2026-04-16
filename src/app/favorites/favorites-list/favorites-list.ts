import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoriteService } from '../../core/services/favorite';
import { FavoriteItem } from '../favorite-item/favorite-item';
import { Loader } from '../../shared/loader/loader';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FavoriteItem, Loader],
  templateUrl: './favorites-list.html',
  styleUrl: './favorites-list.css',
})
export class FavoritesList {
  public favoriteService = inject(FavoriteService);
}
