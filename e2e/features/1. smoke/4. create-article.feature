# language: ru
Функция: Создание статьи

  Сценарий: Создание статьи
    Пусть смотрим на "левую панель"
    И смотрим на "нижнюю панель"
    Когда нажимаем на иконку "плюс"
    Тогда находимся по адресу "/test/new_article_0"
    И разметка текущей статьи ничего не содержит

  Сценарий: Создание вложенной статьи
    Пусть смотрим на "левую панель"
    И смотрим на "навигацию"
    И смотрим на "Тест"
    И наводим мышку
    Когда нажимаем на иконку "плюс"
    Тогда находимся по адресу "/test/test1/new_article_0"
    И разметка текущей статьи ничего не содержит

  Сценарий: Создание статьи во вложенной статье
    Пусть смотрим на "левую панель"
    И смотрим на "навигацию"
    И наводим мышку
    И смотрим на "панель действий статьи"
    Когда нажимаем на иконку "плюс"
    Тогда находимся по адресу "/test/test1/new_article_0/new_article_0"
    И разметка текущей статьи ничего не содержит