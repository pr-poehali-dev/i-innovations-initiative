import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Telegram бот для приема заказов UC в PUBG Mobile
    Обрабатывает команды /start, /buy и callback кнопки с пакетами
    '''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if not bot_token:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True, 'message': 'Bot token not configured'}),
                'isBase64Encoded': False
            }
        
        message = body.get('message', {})
        callback_query = body.get('callback_query', {})
        
        if message:
            return handle_message(message, bot_token)
        elif callback_query:
            return handle_callback(callback_query, bot_token)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'error': str(e)}),
            'isBase64Encoded': False
        }


def handle_message(message: Dict[str, Any], bot_token: str) -> Dict[str, Any]:
    chat_id = message.get('chat', {}).get('id')
    text = message.get('text', '')
    
    if text.startswith('/start'):
        send_welcome(chat_id, bot_token)
    elif text.startswith('/buy'):
        send_packages(chat_id, bot_token)
    else:
        send_help(chat_id, bot_token)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True}),
        'isBase64Encoded': False
    }


def handle_callback(callback_query: Dict[str, Any], bot_token: str) -> Dict[str, Any]:
    import urllib.request
    
    chat_id = callback_query.get('message', {}).get('chat', {}).get('id')
    callback_data = callback_query.get('data', '')
    callback_id = callback_query.get('id')
    
    answer_callback_query(callback_id, bot_token)
    
    if callback_data == 'buy':
        send_packages(chat_id, bot_token)
    elif callback_data.startswith('pkg_'):
        package_id = callback_data.replace('pkg_', '')
        send_payment_info(chat_id, package_id, bot_token)
    elif callback_data == 'support':
        send_support_info(chat_id, bot_token)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True}),
        'isBase64Encoded': False
    }


def send_welcome(chat_id: int, bot_token: str):
    import urllib.request
    
    text = (
        "🎮 <b>Добро пожаловать в PUBG UC Store!</b>\n\n"
        "Здесь вы можете быстро и безопасно купить UC для PUBG Mobile.\n\n"
        "💳 <b>Оплата:</b> DonationAlerts\n"
        "⚡ <b>Зачисление:</b> 5-10 минут\n"
        "🔒 <b>Безопасность:</b> Гарантируем защиту\n\n"
        "Выберите действие:"
    )
    
    keyboard = {
        'inline_keyboard': [
            [{'text': '🛒 Купить UC', 'callback_data': 'buy'}],
            [{'text': '💬 Поддержка', 'callback_data': 'support'}]
        ]
    }
    
    send_message(chat_id, text, bot_token, keyboard)


def send_packages(chat_id: int, bot_token: str):
    packages = [
        {'id': 1, 'amount': 60, 'price': 81},
        {'id': 2, 'amount': 325, 'price': 405, 'bonus': 5},
        {'id': 3, 'amount': 660, 'price': 810, 'bonus': 10},
        {'id': 4, 'amount': 1800, 'price': 2025, 'bonus': 25},
        {'id': 5, 'amount': 3850, 'price': 4050, 'bonus': 50},
        {'id': 6, 'amount': 8100, 'price': 8100, 'bonus': 100},
    ]
    
    text = "💎 <b>Выберите пакет UC:</b>\n\n"
    
    keyboard_buttons = []
    for pkg in packages:
        bonus_text = f" (+{pkg.get('bonus', 0)}% бонус)" if pkg.get('bonus') else ""
        button_text = f"{pkg['amount']} UC - {pkg['price']}₽{bonus_text}"
        keyboard_buttons.append([{'text': button_text, 'callback_data': f"pkg_{pkg['id']}"}])
    
    keyboard = {'inline_keyboard': keyboard_buttons}
    
    send_message(chat_id, text, bot_token, keyboard)


def send_payment_info(chat_id: int, package_id: str, bot_token: str):
    packages = {
        '1': {'amount': 60, 'price': 81},
        '2': {'amount': 325, 'price': 405, 'bonus': 5},
        '3': {'amount': 660, 'price': 810, 'bonus': 10},
        '4': {'amount': 1800, 'price': 2025, 'bonus': 25},
        '5': {'amount': 3850, 'price': 4050, 'bonus': 50},
        '6': {'amount': 8100, 'price': 8100, 'bonus': 100},
    }
    
    pkg = packages.get(package_id)
    if not pkg:
        return
    
    bonus_text = f"\n🎁 Бонус: +{pkg.get('bonus', 0)}%" if pkg.get('bonus') else ""
    
    text = (
        f"📦 <b>Выбран пакет:</b>\n"
        f"💎 {pkg['amount']} UC\n"
        f"💰 Цена: {pkg['price']}₽{bonus_text}\n\n"
        f"<b>Инструкция по оплате:</b>\n\n"
        f"1️⃣ Перейдите по ссылке для оплаты\n"
        f"2️⃣ Укажите сумму: <code>{pkg['price']}</code>₽\n"
        f"3️⃣ В комментарии напишите ваш игровой ID PUBG\n"
        f"4️⃣ Завершите оплату\n\n"
        f"⚡ UC будут зачислены автоматически в течение 5-10 минут\n\n"
        f"💬 Возникли вопросы? Напишите @bitcoin_user1"
    )
    
    keyboard = {
        'inline_keyboard': [
            [{'text': '💳 Перейти к оплате', 'url': f'https://www.donationalerts.com/r/froksi137373?amount={pkg["price"]}'}],
            [{'text': '◀️ Назад к пакетам', 'callback_data': 'buy'}]
        ]
    }
    
    send_message(chat_id, text, bot_token, keyboard)


def send_support_info(chat_id: int, bot_token: str):
    text = (
        "💬 <b>Поддержка 24/7</b>\n\n"
        "По любым вопросам обращайтесь:\n"
        "👤 Telegram: @bitcoin_user1\n\n"
        "⚡ Отвечаем в течение 5 минут!"
    )
    
    keyboard = {
        'inline_keyboard': [
            [{'text': '📱 Написать в поддержку', 'url': 'https://t.me/bitcoin_user1'}],
            [{'text': '◀️ Главное меню', 'callback_data': 'start'}]
        ]
    }
    
    send_message(chat_id, text, bot_token, keyboard)


def send_help(chat_id: int, bot_token: str):
    text = (
        "ℹ️ <b>Доступные команды:</b>\n\n"
        "/start - Главное меню\n"
        "/buy - Купить UC\n\n"
        "Или используйте кнопки ниже:"
    )
    
    keyboard = {
        'inline_keyboard': [
            [{'text': '🛒 Купить UC', 'callback_data': 'buy'}],
            [{'text': '💬 Поддержка', 'callback_data': 'support'}]
        ]
    }
    
    send_message(chat_id, text, bot_token, keyboard)


def send_message(chat_id: int, text: str, bot_token: str, keyboard=None):
    import urllib.request
    import urllib.parse
    
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }
    
    if keyboard:
        data['reply_markup'] = json.dumps(keyboard)
    
    req_data = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=req_data,
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        urllib.request.urlopen(req)
    except Exception:
        pass


def answer_callback_query(callback_id: str, bot_token: str):
    import urllib.request
    
    url = f'https://api.telegram.org/bot{bot_token}/answerCallbackQuery'
    
    data = json.dumps({'callback_query_id': callback_id}).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        urllib.request.urlopen(req)
    except Exception:
        pass
