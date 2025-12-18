import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface UCPackage {
  id: number;
  amount: number;
  price: number;
  popular?: boolean;
  bonus?: number;
}

const packages: UCPackage[] = [
  { id: 1, amount: 60, price: 81 },
  { id: 2, amount: 325, price: 405, bonus: 5 },
  { id: 3, amount: 660, price: 810, bonus: 10, popular: true },
  { id: 4, amount: 1800, price: 2025, bonus: 25 },
  { id: 5, amount: 3850, price: 4050, bonus: 50 },
  { id: 6, amount: 8100, price: 8100, bonus: 100 },
];

interface Order {
  id: string;
  package: UCPackage;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  playerId?: string;
}

const initialOrders: Order[] = [
  {
    id: '1',
    package: { id: 3, amount: 660, price: 810 },
    date: '2024-12-15',
    status: 'completed',
  },
  {
    id: '2',
    package: { id: 1, amount: 60, price: 81 },
    date: '2024-12-10',
    status: 'completed',
  },
];

export default function Index() {
  const [selectedPackage, setSelectedPackage] = useState<UCPackage | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog');
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pubg-orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [playerId, setPlayerId] = useState('');

  useEffect(() => {
    localStorage.setItem('pubg-orders', JSON.stringify(orders));
  }, [orders]);

  const handleBuyClick = (pkg: UCPackage) => {
    setSelectedPackage(pkg);
    setShowPaymentDialog(true);
  };

  const handlePayment = () => {
    if (!selectedPackage || !playerId.trim()) {
      toast.error('Ошибка', {
        description: 'Введите ваш игровой ID PUBG',
      });
      return;
    }
    
    const newOrder: Order = {
      id: Date.now().toString(),
      package: selectedPackage,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      playerId: playerId.trim(),
    };
    
    setOrders(prev => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    
    const donationAlertsUrl = `https://www.donationalerts.com/r/froksi137373?amount=${selectedPackage.price}`;
    window.open(donationAlertsUrl, '_blank');
    
    toast.success('Заказ создан', {
      description: `Заказ #${newOrder.id.slice(-6)} ожидает оплаты`,
    });
    
    setShowPaymentDialog(false);
    setShowStatusDialog(true);
    
    setTimeout(() => {
      setOrders(prev => prev.map(order => 
        order.id === newOrder.id 
          ? { ...order, status: 'completed' as const }
          : order
      ));
      toast.success('UC зачислены!', {
        description: `${selectedPackage.amount} UC добавлены на ваш аккаунт`,
      });
    }, 10000);
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'cancelled' as const }
        : order
    ));
    toast.error('Заказ отменен');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl gradient-purple-blue flex items-center justify-center">
              <Icon name="Gamepad2" size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            PUBG UC Store
          </h1>
          <p className="text-muted-foreground text-lg">
            Быстрая и безопасная покупка UC для PUBG Mobile
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <Icon name="ShoppingBag" size={18} />
              Каталог
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Icon name="User" size={18} />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <Icon name="MessageCircle" size={18} />
              Поддержка
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg, index) => (
                <Card
                  key={pkg.id}
                  className="relative overflow-hidden hover-scale border-2 hover:border-primary transition-all duration-300 animate-scale-in gradient-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {pkg.popular && (
                    <Badge className="absolute top-4 right-4 gradient-purple-blue border-0">
                      Популярно
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold">
                      {pkg.amount} UC
                    </CardTitle>
                    {pkg.bonus && (
                      <CardDescription className="text-green-400 font-medium">
                        +{pkg.bonus}% бонус
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-primary">
                        {pkg.price}₽
                      </span>
                    </div>
                    <Button
                      onClick={() => handleBuyClick(pkg)}
                      className="w-full gradient-purple-blue hover:opacity-90 transition-opacity text-white font-semibold"
                      size="lg"
                    >
                      <Icon name="Zap" size={20} className="mr-2" />
                      Купить сейчас
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="gradient-card border-2 border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Shield" size={24} />
                  Гарантии безопасности
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Lock" size={20} className="text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Безопасная оплата</h3>
                      <p className="text-sm text-muted-foreground">
                        Через DonationAlerts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="Zap" size={20} className="text-secondary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Мгновенно</h3>
                      <p className="text-sm text-muted-foreground">
                        UC зачисляются автоматически
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="HeadphonesIcon" size={20} className="text-accent mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Поддержка 24/7</h3>
                      <p className="text-sm text-muted-foreground">
                        Всегда готовы помочь
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="History" size={24} />
                  История покупок
                </CardTitle>
                <CardDescription>
                  Ваши последние заказы UC
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg gradient-purple-blue flex items-center justify-center">
                            <Icon name="Package" size={24} className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {order.package.amount} UC
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <p className="font-bold text-lg">
                            {order.package.price}₽
                          </p>
                          <div className="flex gap-2">
                            <Badge
                              variant={
                                order.status === 'completed'
                                  ? 'default'
                                  : order.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {order.status === 'completed'
                                ? 'Завершен'
                                : order.status === 'pending'
                                ? 'В обработке'
                                : 'Отменен'}
                            </Badge>
                            {order.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelOrder(order.id)}
                                className="h-6 px-2 text-xs"
                              >
                                Отменить
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon
                      name="ShoppingBag"
                      size={48}
                      className="mx-auto text-muted-foreground mb-4"
                    />
                    <p className="text-muted-foreground">
                      У вас пока нет покупок
                    </p>
                    <Button
                      onClick={() => setActiveTab('catalog')}
                      className="mt-4"
                      variant="outline"
                    >
                      Перейти в каталог
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="MessageCircle" size={24} />
                  Поддержка
                </CardTitle>
                <CardDescription>
                  Свяжитесь с нами по любым вопросам
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-6 rounded-xl gradient-purple-blue">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <Icon name="Send" size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      Telegram поддержка
                    </h3>
                    <p className="text-white/80">
                      Ответим в течение 5 минут
                    </p>
                  </div>
                  <Button
                    onClick={() => window.open('https://t.me/bitcoin_user1', '_blank')}
                    variant="secondary"
                    size="lg"
                    className="font-semibold"
                  >
                    <Icon name="MessageSquare" size={20} className="mr-2" />
                    @bitcoin_user1
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Часто задаваемые вопросы</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-medium mb-1">Как долго зачисляются UC?</p>
                        <p className="text-sm text-muted-foreground">
                          UC зачисляются автоматически в течение 5-10 минут после оплаты
                        </p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Какие способы оплаты?</p>
                        <p className="text-sm text-muted-foreground">
                          Оплата через DonationAlerts: карты, электронные кошельки
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Время работы</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Icon name="Clock" size={20} className="text-primary" />
                        <div>
                          <p className="font-medium">Поддержка</p>
                          <p className="text-sm text-muted-foreground">24/7</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Icon name="Zap" size={20} className="text-secondary" />
                        <div>
                          <p className="font-medium">Обработка заказов</p>
                          <p className="text-sm text-muted-foreground">
                            Автоматически
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Оплата заказа</DialogTitle>
              <DialogDescription>
                Вы будете перенаправлены на страницу DonationAlerts
              </DialogDescription>
            </DialogHeader>
            {selectedPackage && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="playerId" className="text-base font-semibold">
                      Игровой ID PUBG Mobile
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Введите ваш ID из игры для зачисления UC
                    </p>
                    <Input
                      id="playerId"
                      type="text"
                      placeholder="Например: 5123456789"
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value)}
                      className="text-lg h-12"
                    />
                  </div>
                </div>

                <div className="p-6 rounded-xl gradient-card border-2 border-primary/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">Количество UC:</span>
                    <span className="text-2xl font-bold">
                      {selectedPackage.amount} UC
                    </span>
                  </div>
                  {selectedPackage.bonus && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-muted-foreground">Бонус:</span>
                      <span className="text-green-400 font-semibold">
                        +{selectedPackage.bonus}%
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-lg font-semibold">Итого:</span>
                    <span className="text-3xl font-bold text-primary">
                      {selectedPackage.price}₽
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handlePayment}
                    className="w-full gradient-purple-blue hover:opacity-90 text-white font-semibold"
                    size="lg"
                    disabled={!playerId.trim()}
                  >
                    <Icon name="CreditCard" size={20} className="mr-2" />
                    Перейти к оплате
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPaymentDialog(false);
                      setPlayerId('');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Отмена
                  </Button>
                </div>

                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Icon name="Info" size={16} className="mt-0.5" />
                  <p>
                    После оплаты UC будут автоматически зачислены на ваш аккаунт в
                    течение 5-10 минут
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon name="Clock" size={24} className="text-secondary" />
                Статус заказа
              </DialogTitle>
              <DialogDescription>
                Отслеживайте статус вашего заказа
              </DialogDescription>
            </DialogHeader>
            {currentOrder && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl gradient-card border-2 border-secondary/50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">Номер заказа:</span>
                    <span className="font-mono font-bold">
                      #{currentOrder.id.slice(-6)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">Количество:</span>
                    <span className="text-xl font-bold">
                      {currentOrder.package.amount} UC
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-muted-foreground">Статус:</span>
                    <Badge
                      variant={
                        orders.find(o => o.id === currentOrder.id)?.status === 'completed'
                          ? 'default'
                          : 'secondary'
                      }
                      className="text-sm"
                    >
                      {orders.find(o => o.id === currentOrder.id)?.status === 'completed'
                        ? 'Завершен'
                        : 'В обработке'}
                    </Badge>
                  </div>
                </div>

                {orders.find(o => o.id === currentOrder.id)?.status === 'pending' && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                    <Icon name="Loader2" size={20} className="text-secondary mt-0.5 animate-spin" />
                    <div>
                      <p className="font-semibold mb-1">Ожидаем оплату</p>
                      <p className="text-sm text-muted-foreground">
                        После подтверждения оплаты UC будут зачислены автоматически
                      </p>
                    </div>
                  </div>
                )}

                {orders.find(o => o.id === currentOrder.id)?.status === 'completed' && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <Icon name="CheckCircle" size={20} className="text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">UC зачислены!</p>
                      <p className="text-sm text-muted-foreground">
                        {currentOrder.package.amount} UC добавлены на ваш аккаунт
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => {
                    setShowStatusDialog(false);
                    setActiveTab('profile');
                  }}
                  className="w-full"
                  variant="outline"
                >
                  <Icon name="History" size={20} className="mr-2" />
                  Посмотреть все заказы
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}