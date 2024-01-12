# language: ru
Функция: Начало работы

  Сценарий: Создание каталога
    Пусть находимся на "главной"
    И смотрим на "панель действий"
    Когда нажимаем на кнопку "Добавить каталог"
    И нажимаем на кнопку "Создать новый"
    Тогда находимся по адресу "/catalog_0"
    И разметка текущей статьи содержит
      """
      Это новая статья
      """

  Сценарий: Смена режима редактирования
    Пусть смотрим на "правую панель"
    Когда нажимаем на кнопку "В режим просмотра"
    Тогда видим кнопку "В режим редактирования"

  Сценарий: Смена режима просмотра
    Пусть смотрим на "правую панель"
    И видим кнопку "В режим редактирования"
    Когда нажимаем на кнопку "В режим редактирования"
    Тогда видим кнопку "В режим просмотра"
