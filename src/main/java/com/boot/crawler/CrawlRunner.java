import java.util.Set;

import org.json.JSONObject;

public class CrawlRunner {

    public static void main(String[] args) throws Exception {

        System.out.println("===== VisitBusan 전체 크롤링 시작 =====");

        Set<String> seqs = null;

        try {
            // ★ SeleniumListCrawler 클래스를 동적으로 로딩해서 있는 경우만 실행
            Class<?> clazz = Class.forName("com.boot.crawler.SeleniumListCrawler");

            var method = clazz.getMethod("crawlAllUcSeq");
            seqs = (Set<String>) method.invoke(null);

            System.out.println("Selenium 크롤러 활성화됨. UC_SEQ 수집: " + seqs.size());

        } catch (Throwable e) {
            // ★ Selenium 불가 (팀원 PC, 서버, 일반 환경)
            System.out.println("Selenium 환경 없음 → Selenium 크롤러 비활성화.");
            System.out.println("대신 기본 seq 리스트 사용 또는 Jsoup 버전 사용 예정.");

            // ★ 옵션: 빈 seq
            seqs = Set.of();

            // 또는 Jsoup 기반 seq 목록 수집기 사용 가능:
            // seqs = JsoupSeqCrawler.crawlAll();
        }

        // ----- 상세 파싱 실행 -----
        for (String seq : seqs) {
            String url =
                    "https://www.visitbusan.net/index.do?menuCd=DOM_000000201001001000"
                    + "&uc_seq=" + seq
                    + "&lang_cd=ko";

            System.out.println("\n▶ 상세 파싱: " + url);

            JSONObject detail = VisitBusanDetailParser.parse(url);
            System.out.println(detail.toString(4));
        }

        System.out.println("===== VisitBusan 전체 크롤링 종료 =====");
    }
}
