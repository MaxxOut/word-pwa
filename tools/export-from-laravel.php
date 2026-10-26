<?php
// Перенос слов из старого бэкенда (Laravel + MySQL) в CSV нового формата — с прогрессом.
// Подключение к базе берётся из настроек самого бэкенда.
//
// Бэкенд работает в Docker (контейнер myapp_php, папка backend смонтирована в /var/www).
// В WSL, при запущенном docker compose:
//   cp /mnt/d/projects/translates-apps/word-pwa/tools/export-from-laravel.php ~/projects/myapp/backend/
//   docker exec -w /var/www myapp_php php export-from-laravel.php
//
// Результат: backend/export-words/user<id>/words_<язык>.csv (папку можно передать аргументом).
// Потом скрипт и папку из backend можно удалить.
// Файл загружается в приложении: Слова → Импорт, в библиотеку того же языка.
// История активности (study_sessions) не переносится.

$root = getcwd();
if (!is_file("$root/artisan")) {
    fwrite(STDERR, "Запустите из папки Laravel-бэкенда (там, где artisan)\n");
    exit(1);
}

require "$root/vendor/autoload.php";
$app = require "$root/bootstrap/app.php";
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$out = rtrim($argv[1] ?? "$root/export-words", '/');

// в базе время в UTC без зоны → ISO, как в новом приложении
function iso(?string $value): string
{
    return $value ? (new DateTime($value, new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s.v\Z') : '';
}

function items(?string $json): string
{
    $list = json_decode($json ?? '[]', true);
    $list = array_filter(is_array($list) ? $list : [], fn ($s) => is_string($s) && trim($s) !== '');
    return implode('|', array_map('trim', $list));
}

$libraries = DB::table('libraries')->orderBy('id')->get();

foreach ($libraries as $lib) {
    $code = strtolower($lib->lang_code ?? $lib->short_name ?? "lib$lib->id");
    $dir  = "$out/user$lib->user_id";
    @mkdir($dir, 0777, true);

    $file = fopen("$dir/words_$code.csv", 'w');
    fwrite($file, "\u{FEFF}");

    $count = 0;
    $words = DB::table('words')->where('library_id', $lib->id)->orderBy('id')->cursor();
    foreach ($words as $w) {
        $status = implode('|', array_filter([$w->is_learned ? 'learned' : '', $w->is_ignored ? 'ignored' : '']));
        fputcsv($file, [
            $w->word,
            items($w->translation),
            $w->transcription ?? '',
            items($w->examples),
            $status,
            $w->is_learned ? iso($w->learned_at) : '',
            $w->is_learned ? iso($w->repeated_at) : '',
            iso($w->created_at),
        ], ';', '"', '');
        $count++;
    }
    fclose($file);

    echo "user$lib->user_id/words_$code.csv — $count\n";
}
