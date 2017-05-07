// This is a custom build script that compiles a statically linkable object file of the underlying
// libc (musl) and this package's functionality to LLVM bitcode.

// This is super experimental, doesn't cover all of musl and will probably require a lot of tweaks
// in the future. If you need something special from libc, feel free to send a PR, but beware that
// there are no threads (yet) for example, and that stdio works entirely different here, if at all.

var sources = [

    "musl-wasm32/src/linux/sbrk.c",
    "musl-wasm32/src/malloc/malloc.c",
    "musl-wasm32/src/exit/abort.c",
    "musl-wasm32/src/exit/exit.c",
    "musl-wasm32/src/errno/__errno_location.c", // is &__pthread_self()->errno_val by default
    "musl/src/errno/strerror.c",

    "musl/src/string/bcmp.c",
    "musl/src/string/bcopy.c",
    "musl/src/string/bzero.c",
    "musl/src/string/index.c",
    "musl/src/string/memccpy.c",
    "musl/src/string/memchr.c",
    "musl/src/string/memcmp.c",
    "musl/src/string/memcpy.c",
    "musl/src/string/memmem.c",
    "musl/src/string/memmove.c",
    "musl/src/string/mempcpy.c",
    "musl/src/string/memrchr.c",
    "musl/src/string/memset.c",
    "musl/src/string/rindex.c",
    "musl/src/string/stpcpy.c",
    "musl/src/string/stpncpy.c",
    "musl/src/string/strcasecmp.c",
    "musl/src/string/strcasestr.c",
    "musl/src/string/strcat.c",
    "musl/src/string/strchr.c",
    "musl/src/string/strchrnul.c",
    "musl/src/string/strcmp.c",
    "musl/src/string/strcpy.c",
    "musl/src/string/strcspn.c",
    "musl/src/string/strdup.c",
    "musl/src/string/strerror_r.c",
    "musl/src/string/strlcat.c",
    "musl/src/string/strlcpy.c",
    "musl/src/string/strlen.c",
    "musl/src/string/strncasecmp.c",
    "musl/src/string/strncat.c",
    "musl/src/string/strncmp.c",
    "musl/src/string/strncpy.c",
    "musl/src/string/strndup.c",
    "musl/src/string/strnlen.c",
    "musl/src/string/strpbrk.c",
    "musl/src/string/strrchr.c",
    "musl/src/string/strsep.c",
    "musl/src/string/strsignal.c",
    "musl/src/string/strspn.c",
    "musl/src/string/strstr.c",
    "musl/src/string/strtok_r.c",
    "musl/src/string/strtok.c",
    "musl/src/string/strverscmp.c",
    // "musl/src/string/swab.c",
    "musl/src/string/wcpcpy.c",
    "musl/src/string/wcpncpy.c",
    "musl/src/string/wcscasecmp_l.c",
    "musl/src/string/wcscasecmp.c",
    "musl/src/string/wcscat.c",
    "musl/src/string/wcschr.c",
    "musl/src/string/wcscmp.c",
    "musl/src/string/wcscpy.c",
    "musl/src/string/wcscspn.c",
    "musl/src/string/wcsdup.c",
    "musl/src/string/wcslen.c",
    "musl/src/string/wcsncasecmp_l.c",
    "musl/src/string/wcsncasecmp.c",
    "musl/src/string/wcsncat.c",
    "musl/src/string/wcsncmp.c",
    "musl/src/string/wcsncpy.c",
    "musl/src/string/wcsnlen.c",
    "musl/src/string/wcspbrk.c",
    "musl/src/string/wcsrchr.c",
    "musl/src/string/wcsspn.c",
    "musl/src/string/wcsstr.c",
    "musl/src/string/wcstok.c",
    "musl/src/string/wcswcs.c",
    "musl/src/string/wmemchr.c",
    "musl/src/string/wmemcmp.c",
    "musl/src/string/wmemcpy.c",
    "musl/src/string/wmemmove.c",
    "musl/src/string/wmemset.c",

    "musl/src/multibyte/btowc.c",
    "musl/src/multibyte/c16rtomb.c",
    "musl/src/multibyte/c32rtomb.c",
    "musl/src/multibyte/internal.c",
    "musl/src/multibyte/mblen.c",
    "musl/src/multibyte/mbrlen.c",
    "musl/src/multibyte/mbrtoc16.c",
    "musl/src/multibyte/mbrtoc32.c",
    "musl/src/multibyte/mbrtowc.c",
    "musl/src/multibyte/mbsinit.c",
    "musl/src/multibyte/mbsnrtowcs.c",
    "musl/src/multibyte/mbsrtowcs.c",
    "musl/src/multibyte/mbstowcs.c",
    "musl/src/multibyte/mbtowc.c",
    "musl/src/multibyte/wcrtomb.c",
    "musl/src/multibyte/wcsnrtombs.c",
    "musl/src/multibyte/wcsrtombs.c",
    "musl/src/multibyte/wcstombs.c",
    "musl/src/multibyte/wctob.c",
    "musl/src/multibyte/wctomb.c",

    "musl/src/stdlib/abs.c",
    "musl/src/stdlib/atof.c",
    "musl/src/stdlib/atoi.c",
    "musl/src/stdlib/atol.c",
    "musl/src/stdlib/atoll.c",
    "musl/src/stdlib/bsearch.c",
    "musl/src/stdlib/div.c",
    "musl/src/stdlib/ecvt.c",
    "musl/src/stdlib/fcvt.c",
    "musl/src/stdlib/gcvt.c",
    "musl/src/stdlib/imaxabs.c",
    "musl/src/stdlib/imaxdiv.c",
    "musl/src/stdlib/labs.c",
    "musl/src/stdlib/ldiv.c",
    "musl/src/stdlib/llabs.c",
    "musl/src/stdlib/lldiv.c",
    "musl/src/stdlib/qsort.c",
    // "musl/src/stdlib/strtod.c",
    // "musl/src/stdlib/strtol.c",
    // "musl/src/stdlib/wcstod.c",
    // "musl/src/stdlib/wcstol.c",

    "musl/src/search/hsearch.c",
    "musl/src/search/insque.c",
    "musl/src/search/lsearch.c",
    "musl/src/search/tdestroy.c",
    "musl/src/search/tsearch_avl.c",

    "musl/src/math/__cos.c",
    "musl/src/math/__cosdf.c",
    "musl/src/math/__cosl.c",
    "musl/src/math/__expo2.c",
    "musl/src/math/__expo2f.c",
    "musl/src/math/__fpclassify.c",
    "musl/src/math/__fpclassifyf.c",
    "musl/src/math/__fpclassifyl.c",
    "musl/src/math/__invtrigl.c",
    "musl/src/math/__polevll.c",
    "musl/src/math/__rem_pio2.c",
    "musl/src/math/__rem_pio2f.c",
    "musl/src/math/__rem_pio2l.c",
    "musl/src/math/__rem_pio2_large.c",
    "musl/src/math/__signbit.c",
    "musl/src/math/__signbitf.c",
    "musl/src/math/__signbitl.c",
    "musl/src/math/__sin.c",
    "musl/src/math/__sindf.c",
    "musl/src/math/__sinl.c",
    "musl/src/math/__tan.c",
    "musl/src/math/__tandf.c",
    "musl/src/math/__tanl.c",
    "musl/src/math/acos.c",
    "musl/src/math/acosf.c",
    "musl/src/math/acosh.c",
    "musl/src/math/acoshf.c",
    "musl/src/math/acoshl.c",
    "musl/src/math/acosl.c",
    "musl/src/math/asin.c",
    "musl/src/math/asinf.c",
    "musl/src/math/asinh.c",
    "musl/src/math/asinhf.c",
    "musl/src/math/asinhl.c",
    "musl/src/math/asinl.c",
    "musl/src/math/atan.c",
    "musl/src/math/atan2.c",
    "musl/src/math/atan2f.c",
    "musl/src/math/atan2l.c",
    "musl/src/math/atanf.c",
    "musl/src/math/atanh.c",
    "musl/src/math/atanhf.c",
    "musl/src/math/atanhl.c",
    "musl/src/math/atanl.c",
    "musl/src/math/cbrt.c",
    "musl/src/math/cbrtf.c",
    "musl/src/math/cbrtl.c",
    "musl/src/math/ceil.c",
    "musl/src/math/ceilf.c",
    "musl/src/math/ceill.c",
    "musl/src/math/copysign.c",
    "musl/src/math/copysignf.c",
    "musl/src/math/copysignl.c",
    "musl/src/math/cos.c",
    "musl/src/math/cosf.c",
    "musl/src/math/cosh.c",
    "musl/src/math/coshf.c",
    "musl/src/math/coshl.c",
    "musl/src/math/cosl.c",
    "musl/src/math/erf.c",
    "musl/src/math/erff.c",
    "musl/src/math/erfl.c",
    "musl/src/math/exp.c",
    "musl/src/math/exp10.c",
    "musl/src/math/exp10f.c",
    "musl/src/math/exp10l.c",
    "musl/src/math/exp2.c",
    "musl/src/math/exp2f.c",
    "musl/src/math/exp2l.c",
    "musl/src/math/expf.c",
    "musl/src/math/expl.c",
    "musl/src/math/expm1.c",
    "musl/src/math/expm1f.c",
    "musl/src/math/expm1l.c",
    "musl/src/math/fabs.c",
    "musl/src/math/fabsf.c",
    "musl/src/math/fabsl.c",
    "musl/src/math/fdim.c",
    "musl/src/math/fdimf.c",
    "musl/src/math/fdiml.c",
    "musl/src/math/finite.c",
    "musl/src/math/finitef.c",
    "musl/src/math/floor.c",
    "musl/src/math/floorf.c",
    "musl/src/math/floorl.c",
    "musl/src/math/fma.c",
    "musl/src/math/fmaf.c",
    "musl/src/math/fmal.c",
    "musl/src/math/fmax.c",
    "musl/src/math/fmaxf.c",
    "musl/src/math/fmaxl.c",
    "musl/src/math/fmin.c",
    "musl/src/math/fminf.c",
    "musl/src/math/fminl.c",
    "musl/src/math/fmod.c",
    "musl/src/math/fmodf.c",
    "musl/src/math/fmodl.c",
    "musl/src/math/frexp.c",
    "musl/src/math/frexpf.c",
    "musl/src/math/frexpl.c",
    "musl/src/math/hypot.c",
    "musl/src/math/hypotf.c",
    "musl/src/math/hypotl.c",
    "musl/src/math/ilogb.c",
    "musl/src/math/ilogbf.c",
    "musl/src/math/ilogbl.c",
    "musl/src/math/j0.c",
    "musl/src/math/j0f.c",
    "musl/src/math/j1.c",
    "musl/src/math/j1f.c",
    "musl/src/math/jn.c",
    "musl/src/math/jnf.c",
    "musl/src/math/ldexp.c",
    "musl/src/math/ldexpf.c",
    "musl/src/math/ldexpl.c",
    "musl/src/math/lgamma_r.c",
    "musl/src/math/lgamma.c",
    "musl/src/math/lgammaf_r.c",
    "musl/src/math/lgammaf.c",
    "musl/src/math/lgammal.c",
    "musl/src/math/llrint.c",
    "musl/src/math/llrintf.c",
    "musl/src/math/llrintl.c",
    "musl/src/math/llround.c",
    "musl/src/math/llroundf.c",
    "musl/src/math/llroundl.c",
    "musl/src/math/log.c",
    "musl/src/math/log10.c",
    "musl/src/math/log10f.c",
    "musl/src/math/log10l.c",
    "musl/src/math/log1p.c",
    "musl/src/math/log1pf.c",
    "musl/src/math/log1pl.c",
    "musl/src/math/log2.c",
    "musl/src/math/log2f.c",
    "musl/src/math/log2l.c",
    "musl/src/math/logb.c",
    "musl/src/math/logbf.c",
    "musl/src/math/logbl.c",
    "musl/src/math/logf.c",
    "musl/src/math/logl.c",
    "musl/src/math/lrint.c",
    "musl/src/math/lrintf.c",
    "musl/src/math/lrintl.c",
    "musl/src/math/lround.c",
    "musl/src/math/lroundf.c",
    "musl/src/math/lroundl.c",
    "musl/src/math/modf.c",
    "musl/src/math/modff.c",
    "musl/src/math/modfl.c",
    "musl/src/math/nan.c",
    "musl/src/math/nanf.c",
    "musl/src/math/nanl.c",
    "musl/src/math/nearbyint.c",
    "musl/src/math/nearbyintf.c",
    "musl/src/math/nearbyintl.c",
    "musl/src/math/nextafter.c",
    "musl/src/math/nextafterf.c",
    "musl/src/math/nextafterl.c",
    "musl/src/math/nexttoward.c",
    "musl/src/math/nexttowardf.c",
    "musl/src/math/nexttowardl.c",
    "musl/src/math/pow.c",
    "musl/src/math/powf.c",
    "musl/src/math/powl.c",
    "musl/src/math/remainder.c",
    "musl/src/math/remainderf.c",
    "musl/src/math/remainderl.c",
    "musl/src/math/remquo.c",
    "musl/src/math/remquof.c",
    "musl/src/math/remquol.c",
    "musl/src/math/rint.c",
    "musl/src/math/rintf.c",
    "musl/src/math/rintl.c",
    "musl/src/math/round.c",
    "musl/src/math/roundf.c",
    "musl/src/math/roundl.c",
    "musl/src/math/scalb.c",
    "musl/src/math/scalbf.c",
    "musl/src/math/scalbln.c",
    "musl/src/math/scalblnf.c",
    "musl/src/math/scalblnl.c",
    "musl/src/math/scalbn.c",
    "musl/src/math/scalbnf.c",
    "musl/src/math/scalbnl.c",
    "musl/src/math/signgam.c",
    "musl/src/math/significand.c",
    "musl/src/math/significandf.c",
    "musl/src/math/sin.c",
    "musl/src/math/sincos.c",
    "musl/src/math/sincosf.c",
    "musl/src/math/sincosl.c",
    "musl/src/math/sinf.c",
    "musl/src/math/sinh.c",
    "musl/src/math/sinhf.c",
    "musl/src/math/sinhl.c",
    "musl/src/math/sinl.c",
    "musl/src/math/sqrt.c",
    "musl/src/math/sqrtf.c",
    "musl/src/math/sqrtl.c",
    "musl/src/math/tan.c",
    "musl/src/math/tanf.c",
    "musl/src/math/tanh.c",
    "musl/src/math/tanhf.c",
    "musl/src/math/tanhl.c",
    "musl/src/math/tanl.c",
    "musl/src/math/tgamma.c",
    "musl/src/math/tgammaf.c",
    "musl/src/math/tgammal.c",
    "musl/src/math/trunc.c",
    "musl/src/math/truncf.c",
    "musl/src/math/truncl.c",

    "musl/src/complex/cabs.c",
    "musl/src/complex/cabsf.c",
    "musl/src/complex/cabsl.c",
    "musl/src/complex/cacos.c",
    "musl/src/complex/cacosf.c",
    "musl/src/complex/cacosh.c",
    "musl/src/complex/cacoshf.c",
    "musl/src/complex/cacoshl.c",
    "musl/src/complex/cacosl.c",
    "musl/src/complex/carg.c",
    "musl/src/complex/cargf.c",
    "musl/src/complex/cargl.c",
    "musl/src/complex/casin.c",
    "musl/src/complex/casinf.c",
    "musl/src/complex/casinh.c",
    "musl/src/complex/casinhf.c",
    "musl/src/complex/casinhl.c",
    "musl/src/complex/casinl.c",
    "musl/src/complex/catan.c",
    "musl/src/complex/catanf.c",
    "musl/src/complex/catanh.c",
    "musl/src/complex/catanhf.c",
    "musl/src/complex/catanhl.c",
    "musl/src/complex/catanl.c",
    "musl/src/complex/ccos.c",
    "musl/src/complex/ccosf.c",
    "musl/src/complex/ccosh.c",
    "musl/src/complex/ccoshf.c",
    "musl/src/complex/ccoshl.c",
    "musl/src/complex/ccosl.c",
    "musl/src/complex/cexp.c",
    "musl/src/complex/cexpf.c",
    "musl/src/complex/cexpl.c",
    "musl/src/complex/cimag.c",
    "musl/src/complex/cimagf.c",
    "musl/src/complex/cimagl.c",
    "musl/src/complex/clog.c",
    "musl/src/complex/clogf.c",
    "musl/src/complex/clogl.c",
    "musl/src/complex/conj.c",
    "musl/src/complex/conjf.c",
    "musl/src/complex/conjl.c",
    "musl/src/complex/cpow.c",
    "musl/src/complex/cpowf.c",
    "musl/src/complex/cpowl.c",
    "musl/src/complex/cproj.c",
    "musl/src/complex/cprojf.c",
    "musl/src/complex/cprojl.c",
    "musl/src/complex/creal.c",
    "musl/src/complex/crealf.c",
    "musl/src/complex/creall.c",
    "musl/src/complex/csin.c",
    "musl/src/complex/csinf.c",
    "musl/src/complex/csinh.c",
    "musl/src/complex/csinhf.c",
    "musl/src/complex/csinhl.c",
    "musl/src/complex/csinl.c",
    "musl/src/complex/csqrt.c",
    "musl/src/complex/csqrtf.c",
    "musl/src/complex/csqrtl.c",
    "musl/src/complex/ctan.c",
    "musl/src/complex/ctanf.c",
    "musl/src/complex/ctanh.c",
    "musl/src/complex/ctanhf.c",
    "musl/src/complex/ctanhl.c",
    "musl/src/complex/ctanl.c",
    "musl/src/complex/__cexp.c",
    "musl/src/complex/__cexpf.c",

    "musl/src/regex/fnmatch.c",
    "musl/src/regex/glob.c",
    "musl/src/regex/regcomp.c",
    "musl/src/regex/regerror.c",
    "musl/src/regex/regexec.c",
    "musl/src/regex/tre-mem.c",

    "musl-wasm32/src/crypt/crypt.c",            // for some reason default crypt imports unistd.h
    "musl-wasm32/src/crypt/encrypt.c",
    "musl/src/crypt/crypt_blowfish.c",
    "musl/src/crypt/crypt_des.c",
    "musl/src/crypt/crypt_md5.c",
    "musl/src/crypt/crypt_r.c",
    "musl/src/crypt/crypt_sha256.c",
    "musl/src/crypt/crypt_sha512.c",

    "musl/src/prng/drand48.c",
    "musl/src/prng/lcong48.c",
    "musl/src/prng/lrand48.c",
    "musl/src/prng/mrand48.c",
    "musl/src/prng/rand.c",
    "musl/src/prng/random.c",
    "musl/src/prng/rand_r.c",
    "musl/src/prng/seed48.c",
    "musl/src/prng/srand48.c",
    "musl/src/prng/__rand48_step.c",
    "musl/src/prng/__seed48.c",

    "musl/src/stdio/asprintf.c",                // TODO: stdio_impl
    // "musl/src/stdio/clearerr.c",
    "musl/src/stdio/dprintf.c",
    // "musl/src/stdio/ext.c",
    // "musl/src/stdio/ext2.c",
    "musl/src/stdio/fclose.c",
    "musl/src/stdio/feof.c",
    "musl/src/stdio/ferror.c",
    "musl/src/stdio/fflush.c",
    "musl/src/stdio/fgetc.c",
    "musl/src/stdio/fgetln.c",
    "musl/src/stdio/fgetpos.c",
    "musl/src/stdio/fgets.c",
    "musl/src/stdio/fgetwc.c",
    "musl/src/stdio/fgetws.c",
    // "musl/src/stdio/fileno.c",
    // "musl/src/stdio/flockfile.c",
    "musl/src/stdio/fmemopen.c",
    // "musl/src/stdio/fopen.c",
    "musl/src/stdio/fprintf.c",
    "musl/src/stdio/fputc.c",
    "musl/src/stdio/fputs.c",
    "musl/src/stdio/fputwc.c",
    "musl/src/stdio/fputws.c",
    "musl/src/stdio/fread.c",
    // "musl/src/stdio/freopen.c",
    "musl/src/stdio/fscanf.c",
    // "musl/src/stdio/fseek.c",
    "musl/src/stdio/fsetpos.c",
    // "musl/src/stdio/ftell.c",
    // "musl/src/stdio/ftrylockfile.c",
    // "musl/src/stdio/funlockfile.c",
    "musl/src/stdio/fwide.c",
    "musl/src/stdio/fwprintf.c",
    "musl/src/stdio/fwrite.c",
    "musl/src/stdio/fwscanf.c",
    "musl/src/stdio/getc.c",
    "musl/src/stdio/getchar.c",
    "musl/src/stdio/getchar_unlocked.c",
    "musl/src/stdio/getc_unlocked.c",
    "musl/src/stdio/getdelim.c",
    "musl/src/stdio/getline.c",
    "musl/src/stdio/gets.c",
    "musl/src/stdio/getw.c",
    "musl/src/stdio/getwc.c",
    "musl/src/stdio/getwchar.c",
    // "musl/src/stdio/ofl.c",
    // "musl/src/stdio/ofl_add.c",
    "musl/src/stdio/open_memstream.c",
    "musl/src/stdio/open_wmemstream.c",
    // "musl/src/stdio/pclose.c",
    // "musl/src/stdio/perror.c",
    // "musl/src/stdio/popen.c",
    "musl/src/stdio/printf.c",
    "musl/src/stdio/putc.c",
    "musl/src/stdio/putchar.c",
    "musl/src/stdio/putchar_unlocked.c",
    "musl/src/stdio/putc_unlocked.c",
    "musl/src/stdio/puts.c",
    "musl/src/stdio/putw.c",
    "musl/src/stdio/putwc.c",
    "musl/src/stdio/putwchar.c",
    // "musl/src/stdio/remove.c",
    // "musl/src/stdio/rename.c",
    // "musl/src/stdio/rewind.c",
    "musl/src/stdio/scanf.c",
    "musl/src/stdio/setbuf.c",
    "musl/src/stdio/setbuffer.c",
    "musl/src/stdio/setlinebuf.c",
    "musl/src/stdio/setvbuf.c",
    "musl/src/stdio/snprintf.c",
    "musl/src/stdio/sprintf.c",
    "musl/src/stdio/sscanf.c",
    "musl/src/stdio/stderr.c",
    "musl/src/stdio/stdin.c",
    "musl/src/stdio/stdout.c",
    "musl/src/stdio/swprintf.c",
    "musl/src/stdio/swscanf.c",
    // "musl/src/stdio/tempnam.c",
    // "musl/src/stdio/tmpfile.c",
    // "musl/src/stdio/tmpnam.c",
    "musl/src/stdio/ungetc.c",
    "musl/src/stdio/ungetwc.c",
    "musl/src/stdio/vasprintf.c",
    "musl/src/stdio/vdprintf.c",
    "musl/src/stdio/vfprintf.c",
    "musl/src/stdio/vfscanf.c",
    // "musl/src/stdio/vfwprintf.c",
    "musl/src/stdio/vfwscanf.c",
    "musl/src/stdio/vprintf.c",
    "musl/src/stdio/vscanf.c",
    "musl/src/stdio/vsnprintf.c",
    "musl/src/stdio/vsprintf.c",
    "musl/src/stdio/vsscanf.c",
    "musl/src/stdio/vswprintf.c",
    "musl/src/stdio/vswscanf.c",
    "musl/src/stdio/vwprintf.c",
    "musl/src/stdio/vwscanf.c",
    "musl/src/stdio/wprintf.c",
    "musl/src/stdio/wscanf.c",
    // "musl/src/stdio/__fclose_ca.c",
    // "musl/src/stdio/__fdopen.c",
    // "musl/src/stdio/__fmodeflags.c",
    // "musl/src/stdio/__fopen_rb_ca.c",
    // "musl/src/stdio/__lockfile.c",
    // "musl/src/stdio/__overflow.c",
    // "musl/src/stdio/__stdio_close.c",
    // "musl/src/stdio/__stdio_exit.c",
    // "musl/src/stdio/__stdio_read.c",
    // "musl/src/stdio/__stdio_seek.c",
    // "musl/src/stdio/__stdio_write.c",
    // "musl/src/stdio/__stdout_write.c",
    "musl/src/stdio/__string_read.c",
    "musl/src/stdio/__toread.c",
    "musl/src/stdio/__towrite.c",
    "musl/src/stdio/__uflow.c"
];

var glob  = require("glob"),
    path  = require("path"),
    chalk = require("chalk"),
    util  = require("../cli/util");

util.printLogo("C Library");
util.printHeading("Building on " + process.platform + "-" + process.arch + "...");

for (var i = 0, file; i < sources.length; ) {
    if (glob.hasMagic(file = sources[i])) {
        var files = glob.sync(file, { cwd: __dirname });
        Array.prototype.splice.apply(sources, [ i, 1 ].concat(files));
        i += files.length;
    } else
        ++i;
}

var builddir = path.join(__dirname, "build");

util.run(path.join(util.bindir, "clang"), [

    sources.map(f => path.join("..", f)),
    "-O3",
    "-c",
    "-emit-llvm",
    "-nostdinc",
    "-nostdlib",
    "-fno-builtin",
    "-isystem", path.join("..", "musl-wasm32" , "include"),
    "-I", path.join("..", "musl", "include"),
    "-isystem", path.join("..", "musl", "src" , "internal"),
    "-Dsyscall=#error ",
    "-DCURRENT_LOCALE=UTF8_LOCALE",
    "-DCURRENT_UTF8=1",
    "-DPAGE_SIZE=65536",
    "-Dbrk(v)=-1",
    "-Wno-unknown-pragmas",
    "-Wno-shift-op-parentheses",
    "-Wno-bitwise-op-parentheses"

], { cwd: builddir }).then(() =>

new Promise((resolve, reject) => {
    glob("*.bc", { cwd: builddir }, (err, matches) => {
        if (err)
            reject(err);
        else
            resolve(matches);
    });
})).then((files) =>

util.run(path.join(util.bindir, "llvm-link"), [

    files,
    // "-S",
    "-o", "../webassembly.bc"

], { cwd: builddir }))

.then(util.defaultSuccess, util.defaultCallback);