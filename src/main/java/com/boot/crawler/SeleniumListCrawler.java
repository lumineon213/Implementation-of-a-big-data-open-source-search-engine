package com.boot.crawler;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SeleniumListCrawler {

    // 기본 리스트 URL
    private static final String LIST_URL =
            "https://www.visitbusan.net/index.do" +
            "?menuCd=DOM_000000201001000000" +
            "&list_type=TYPE_SMALL_CARD" +
            "&order_type=NEW" +
            "&listCntPerPage2=16";

    // uc_seq=숫자만 추출
    private static final Pattern UC_SEQ_PATTERN =
            Pattern.compile("[?&]uc_seq=([0-9]+)");

    public static Set<String> crawlAllUcSeq() throws Exception {

        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        // options.addArguments("--headless=new");
        options.addArguments("--disable-gpu");
        options.addArguments("--window-size=1280,1024");

        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));

        Set<String> seqs = new LinkedHashSet<>();

        try {
            int pageNo = 1;

            while (true) {

                String pageUrl = LIST_URL + "&page_no=" + pageNo;
                System.out.printf("=== 페이지 진입: %d (%s)%n", pageNo, pageUrl);

                String beforeUrl = driver.getCurrentUrl();  // URL 변화 체크용
                driver.get(pageUrl);

                // 페이지 이동 후 URL이 동일하면 종료
                if (beforeUrl.equals(driver.getCurrentUrl()) && pageNo > 1) {
                    System.out.println("URL 변화 없음 → 마지막 페이지로 판단하고 종료");
                    break;
                }

                // 명소 카드 로딩 기다리기
                try {
                    wait.until(ExpectedConditions.presenceOfElementLocated(
                            By.cssSelector(".hot-item a")
                    ));
                } catch (TimeoutException e) {
                    System.out.println("이 페이지에 .hot-item이 없음 → 마지막 페이지!");
                    break;
                }

                List<WebElement> links = driver.findElements(By.cssSelector(".hot-item a"));

                // 방어: 만약 리스트가 비어있다면 종료
                if (links.isEmpty()) {
                    System.out.println("링크 목록 비어 있음 → 마지막 페이지");
                    break;
                }

                int before = seqs.size();

                for (WebElement link : links) {
                    String href = link.getAttribute("href");
                    if (href == null || href.isBlank()) continue;

                    Matcher m = UC_SEQ_PATTERN.matcher(href);
                    if (!m.find()) continue;

                    String seq = m.group(1);

                    if (seqs.add(seq)) {
                        System.out.println("  추가됨 → " + seq);
                    }
                }

                int added = seqs.size() - before;

                System.out.printf("페이지 %d 처리 완료: 새로 추가된 명소 %d개, 총 %d개%n",
                        pageNo, added, seqs.size());

                // 새로 들어온 게 없다 → 더 이상 페이지 없음
                if (added == 0) {
                    System.out.println("새로 추가된 명소가 없으므로 종료");
                    break;
                }

                pageNo++;
            }

            // 마지막 페이지 HTML 저장
            Files.writeString(
                    Path.of("visitbusan_last_page.html"),
                    driver.getPageSource(),
                    StandardCharsets.UTF_8
            );
            System.out.println("HTML 저장 완료 → visitbusan_last_page.html");

            System.out.println("총 수집된 명소 수: " + seqs.size());

        } finally {
            driver.quit();
        }

        return seqs;
    }
}
