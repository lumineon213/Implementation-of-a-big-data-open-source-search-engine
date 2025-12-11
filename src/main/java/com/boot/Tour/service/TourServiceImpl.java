package com.boot.Tour.service;

import com.boot.Tour.dao.TourDAO;
import com.boot.Tour.dto.TourDTO;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.apache.solr.common.SolrDocumentList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TourServiceImpl implements TourService {

    @Autowired
    private SolrClient solrClient; // 검색엔진

    @Autowired
    private TourDAO tourDAO; // DB

    // 1. Solr 검색 구현
    @Override
    public List<TourDTO> getTourSpotList(String keyword) {
        List<TourDTO> list = new ArrayList<>();

        try {
            SolrQuery query = new SolrQuery();
            if (keyword != null && !keyword.trim().isEmpty()) {
                query.setQuery("title:*" + keyword + "* OR address:*" + keyword + "*");
            } else {
                query.setQuery("*:*");
            }
            query.setRows(100); 

            // ★ 코어 이름 확인 ("mycore" 등 본인 것 입력)
            QueryResponse response = solrClient.query("Search", query);
            SolrDocumentList results = response.getResults();

            for (SolrDocument doc : results) {
                TourDTO dto = new TourDTO();
                
                String idStr = getSafeString(doc.getFieldValue("id"));
                if(idStr != null) dto.setSpotId(Long.parseLong(idStr));

                dto.setTitle(getSafeString(doc.getFieldValue("title")));
                dto.setAddress(getSafeString(doc.getFieldValue("address")));
                dto.setImageUrl(getSafeString(doc.getFieldValue("image_url")));
                
                String themeIdStr = getSafeString(doc.getFieldValue("theme_id"));
                if (themeIdStr != null) dto.setThemeId(Integer.parseInt(themeIdStr));
                
                dto.setLatitude(getSafeString(doc.getFieldValue("latitude")));
                dto.setLongitude(getSafeString(doc.getFieldValue("longitude")));
                
                list.add(dto);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    // 2. DB 상세 조회 구현
    @Override
    public TourDTO getTourSpotById(Long id) {
        return tourDAO.selectSpotById(id);
    }

    // 3. DB 조회수 증가 구현
    @Override
    public void increaseViewCount(Long id) {
        tourDAO.updateViewCount(id);
    }

    // 안전한 문자열 변환 헬퍼
    private String getSafeString(Object obj) {
        if (obj == null) return null;
        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            return list.isEmpty() ? null : list.get(0).toString();
        }
        return obj.toString();
    }
}