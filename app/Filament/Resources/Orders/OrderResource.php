<?php

namespace App\Filament\Resources\Orders;

use App\Filament\Resources\Orders\Pages\ListOrders;
use App\Filament\Resources\Orders\Pages\ViewOrder;
use App\Models\Order;
use App\Support\StaffOrderAccess;
use BackedEnum;
use Filament\Actions\ViewAction;
use Filament\Resources\Resource;
use Filament\Tables\Columns\Layout\Split;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use UnitEnum;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;
    protected static ?string $slug = 'orders';
    protected static ?string $recordTitleAttribute = 'order_number';
    protected static string | UnitEnum | null $navigationGroup = 'Sales & support';
    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-clipboard-document-list';
    protected static ?int $navigationSort = 1;

    public static function getEloquentQuery(): Builder
    {
        abort_unless(StaffOrderAccess::allows(auth('web')->user()), 403);
        return parent::getEloquentQuery()->withCount('items');
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            Split::make([
                Stack::make([
                    TextColumn::make('order_number')->searchable()->weight('bold'),
                    TextColumn::make('customer_name')->searchable()->wrap(),
                    TextColumn::make('customer_email')->searchable()->color('gray')->wrap(),
                ]),
                Stack::make([
                    TextColumn::make('status')->badge()->color(fn (string $state): string => match ($state) { 'delivered' => 'success', 'cancelled' => 'gray', 'pending' => 'warning', default => 'info' }),
                    TextColumn::make('payment_status')->badge()->formatStateUsing(fn (string $state): string => $state === 'paid' ? 'Marked paid' : 'Payment pending')->color(fn (string $state): string => $state === 'paid' ? 'success' : 'warning'),
                ]),
                Stack::make([
                    TextColumn::make('total')->money(config('commerce.currency', 'USD')),
                    TextColumn::make('items_count')->suffix(' item lines'),
                    TextColumn::make('created_at')->dateTime('d M Y H:i')->color('gray'),
                ]),
            ])->from('md'),
        ])->defaultSort('created_at', 'desc')->filters([
            SelectFilter::make('status')->options(['pending' => 'Pending', 'processing' => 'Processing', 'shipped' => 'Shipped', 'delivered' => 'Delivered / collected', 'cancelled' => 'Cancelled']),
            SelectFilter::make('payment_status')->options(['pending' => 'Payment pending', 'paid' => 'Marked paid']),
            SelectFilter::make('fulfillment_method')->options(['delivery' => 'Delivery', 'pickup' => 'Pickup']),
        ])->recordActions([ViewAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ListOrders::route('/'), 'view' => ViewOrder::route('/{record}')];
    }
}
