package com.petcare.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.petcare.model.AnalysisResult;
import com.petcare.model.Hospital;
import com.petcare.model.HospitalRecommendation;
import com.petcare.model.SymptomRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AI 서비스 - Google Gemini API를 사용한 실제 구현
 */
@Service
public class AIService {
    
    private final WebClient webClient;
    private final String apiKey;
    private final String apiUrl;
    private final String model;
    private final ObjectMapper objectMapper;
    
    public AIService(@Value("${ai.gemini.api.key}") String apiKey,
                     @Value("${ai.gemini.api.url}") String apiUrl,
                     @Value("${ai.gemini.model}") String model) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.model = model;
        this.objectMapper = new ObjectMapper();
        
        // API 키 검증 및 디버깅
        System.out.println("=== Gemini API 키 로드 확인 ===");
        System.out.println("환경 변수 GEMINI_API_KEY: " + System.getenv("GEMINI_API_KEY"));
        System.out.println("로드된 API 키 값: " + (apiKey == null ? "null" : (apiKey.length() > 20 ? apiKey.substring(0, 20) + "..." : apiKey)));
        System.out.println("API 키 길이: " + (apiKey == null ? "null" : apiKey.length()));
        
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("your-gemini-api-key-here")) {
            System.err.println("⚠️ 경고: Gemini API 키가 설정되지 않았습니다!");
            System.err.println("⚠️ 환경 변수 GEMINI_API_KEY를 설정하거나 application.properties에서 ai.gemini.api.key를 설정하세요.");
            System.err.println("⚠️ API 키 발급: https://aistudio.google.com/app/apikey");
            System.err.println("⚠️ IntelliJ 설정 방법:");
            System.err.println("   1. Run → Edit Configurations...");
            System.err.println("   2. Spring Boot 애플리케이션 선택");
            System.err.println("   3. Environment variables 섹션에서:");
            System.err.println("      - Name: GEMINI_API_KEY");
            System.err.println("      - Value: AIzaSyACTHrxQnjLd5EOqimW3XdrD1CRcmjDpkM");
            System.err.println("   4. Apply → OK 후 재시작");
        } else {
            System.out.println("✅ Gemini API 키가 설정되었습니다. (길이: " + apiKey.length() + "자, 시작: " + apiKey.substring(0, Math.min(10, apiKey.length())) + "...)");
        }
        
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
    
    /**
     * AI1: 증상 분석 및 구조화
     */
    public AnalysisResult analyzeSymptoms(SymptomRequest symptomRequest, String petInfo) {
        try {
            // 디버깅: 증상 정보 로그
            System.out.println("=== 증상 분석 요청 ===");
            System.out.println("선택한 증상: " + (symptomRequest.getSelectedSymptoms() != null ? symptomRequest.getSelectedSymptoms() : "없음"));
            System.out.println("증상 상세 설명: " + symptomRequest.getMainComplaint());
            System.out.println("경과 시간: " + symptomRequest.getOnsetHoursAgo() + "시간");
            
            // 프롬프트 생성
            String prompt = buildAnalysisPrompt(symptomRequest, petInfo);
            System.out.println("생성된 프롬프트 길이: " + prompt.length() + "자");
            
            // Gemini API 호출
            String response = callGemini(prompt);
            
            // 응답 파싱
            AnalysisResult result = parseAnalysisResponse(response, symptomRequest.getPetId());
            System.out.println("✅ 분석 결과 - 긴급도: " + result.getUrgencyLevel() + ", 카테고리: " + result.getCategory());
            System.out.println("✅ 추천 진료과: " + result.getRecommendedDepartment());
            if (result.getDiseaseCandidates() != null && !result.getDiseaseCandidates().isEmpty()) {
                System.out.println("✅ 가능한 질환: " + result.getDiseaseCandidates().stream()
                    .map(d -> d.getName() + "(" + String.format("%.1f", d.getProbability() * 100) + "%)")
                    .collect(Collectors.joining(", ")));
            }
            
            return result;
            
        } catch (Exception e) {
            System.err.println("AI 분석 실패: " + e.getMessage());
            e.printStackTrace();
            // 실패 시 Mock 데이터 반환
            return createMockAnalysisResult(symptomRequest.getPetId());
        }
    }
    
    /**
     * AI2: 맞춤형 설명 및 병원 추천
     */
    public HospitalRecommendation recommendHospitals(
            AnalysisResult analysisResult, 
            String userLocation, 
            List<Hospital> availableHospitals) {
        
        try {
            // 디버깅: 분석 결과 로그
            System.out.println("=== 병원 추천 요청 ===");
            System.out.println("분석 결과 - 긴급도: " + analysisResult.getUrgencyLevel());
            System.out.println("가능한 질환: " + (analysisResult.getDiseaseCandidates() != null ? 
                analysisResult.getDiseaseCandidates().stream().map(d -> d.getName()).collect(Collectors.joining(", ")) : "없음"));
            System.out.println("사용 가능한 병원 수: " + availableHospitals.size());
            
            // 프롬프트 생성
            String prompt = buildRecommendationPrompt(analysisResult, userLocation, availableHospitals);
            
            // Gemini API 호출
            String response = callGemini(prompt);
            
            // 응답 파싱
            HospitalRecommendation recommendation = parseRecommendationResponse(response, analysisResult, availableHospitals);
            System.out.println("최종 추천 병원 수: " + recommendation.getRecommendedHospitals().size());
            
            return recommendation;
            
        } catch (Exception e) {
            System.err.println("병원 추천 실패: " + e.getMessage());
            e.printStackTrace();
            // 실패 시 Mock 데이터 반환
            return createMockRecommendation(analysisResult, availableHospitals);
        }
    }
    
    private String buildAnalysisPrompt(SymptomRequest symptomRequest, String petInfo) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("당신은 수의학 전문가입니다. 반려동물의 증상을 분석하여 가능한 질환을 추론해주세요.\n\n");
        prompt.append("반려동물 정보:\n").append(petInfo).append("\n\n");
        prompt.append("=== 증상 정보 ===\n");
        
        // 선택한 증상 리스트 표시 (중요: 이 증상들을 반드시 고려해야 함)
        if (symptomRequest.getSelectedSymptoms() != null && !symptomRequest.getSelectedSymptoms().isEmpty()) {
            prompt.append("【선택한 증상 목록 - 반드시 이 증상들을 기반으로 분석하세요】\n");
            for (int i = 0; i < symptomRequest.getSelectedSymptoms().size(); i++) {
                prompt.append("  ").append(i + 1).append(". ").append(symptomRequest.getSelectedSymptoms().get(i)).append("\n");
            }
            prompt.append("\n⚠️ 중요: 위 증상들을 반드시 종합적으로 고려하여 분석하세요. 이 증상들과 일치하지 않는 카테고리로 분류하지 마세요.\n\n");
            
            // 증상 카테고리 힌트 제공
            String symptomsStr = String.join(", ", symptomRequest.getSelectedSymptoms());
            if (symptomsStr.contains("기침") || symptomsStr.contains("재채기") || symptomsStr.contains("코막힘") || 
                symptomsStr.contains("콧물") || symptomsStr.contains("호흡곤란") || symptomsStr.contains("숨가쁨")) {
                prompt.append("💡 힌트: 선택한 증상들(기침, 재채기, 코막힘 등)은 호흡기 증상에 해당합니다. 카테고리는 '호흡기'로 설정해야 합니다.\n\n");
            }
            if (symptomsStr.contains("구토") || symptomsStr.contains("설사") || symptomsStr.contains("변비") || 
                symptomsStr.contains("식욕부진") || symptomsStr.contains("복부팽만")) {
                prompt.append("💡 힌트: 선택한 증상들(구토, 설사, 변비 등)은 소화기 증상에 해당합니다. 카테고리는 '소화기'로 설정해야 합니다.\n\n");
            }
            if (symptomsStr.contains("절뚝거림") || symptomsStr.contains("보행이상") || symptomsStr.contains("관절부종")) {
                prompt.append("💡 힌트: 선택한 증상들(절뚝거림, 보행이상 등)은 정형외과 증상에 해당합니다. 카테고리는 '정형외과'로 설정해야 합니다.\n\n");
            }
            if (symptomsStr.contains("가려움") || symptomsStr.contains("탈모") || symptomsStr.contains("발진")) {
                prompt.append("💡 힌트: 선택한 증상들(가려움, 탈모, 발진 등)은 피부과 증상에 해당합니다. 카테고리는 '피부과'로 설정해야 합니다.\n\n");
            }
        }
        
        // 증상 상세 설명 강조
        if (symptomRequest.getMainComplaint() != null && !symptomRequest.getMainComplaint().trim().isEmpty()) {
            prompt.append("【증상 상세 설명 - 매우 중요】\n");
            prompt.append("\"").append(symptomRequest.getMainComplaint()).append("\"\n");
            prompt.append("⚠️ 이 설명을 매우 중요하게 고려하세요. 이 설명에 언급된 증상과 선택한 증상 목록이 일치해야 합니다.\n\n");
        }
        
        prompt.append("【증상 시작 후 경과 시간】\n");
        prompt.append(symptomRequest.getOnsetHoursAgo()).append("시간 전부터 시작됨\n\n");
        
        // 응급 상황
        prompt.append("【응급 상황 체크】\n");
        if (symptomRequest.getEmergencyFlags() != null) {
            boolean hasEmergency = false;
            if (symptomRequest.getEmergencyFlags().getDifficultyBreathing()) {
                prompt.append("  ⚠️ 호흡 곤란: 예\n");
                hasEmergency = true;
            }
            if (symptomRequest.getEmergencyFlags().getContinuousVomiting()) {
                prompt.append("  ⚠️ 지속적인 구토: 예\n");
                hasEmergency = true;
            }
            if (symptomRequest.getEmergencyFlags().getCannotStand()) {
                prompt.append("  ⚠️ 일어설 수 없음: 예\n");
                hasEmergency = true;
            }
            if (symptomRequest.getEmergencyFlags().getLossOfConsciousness()) {
                prompt.append("  ⚠️ 의식 잃음: 예\n");
                hasEmergency = true;
            }
            if (symptomRequest.getEmergencyFlags().getSevereBleeding()) {
                prompt.append("  ⚠️ 심한 출혈: 예\n");
                hasEmergency = true;
            }
            if (!hasEmergency) {
                prompt.append("  응급 상황 없음\n");
            }
        }
        prompt.append("\n");
        prompt.append("=== 분석 지침 ===\n");
        prompt.append("1. 【최우선】선택한 증상 목록과 증상 상세 설명을 모두 종합하여 분석하세요.\n");
        prompt.append("2. 【필수】선택한 증상들의 조합과 패턴을 매우 중요하게 고려하여 진단하세요.\n");
        prompt.append("3. 【필수】증상 상세 설명에 언급된 내용을 반드시 반영하세요.\n");
        prompt.append("4. 【중요】카테고리는 선택한 증상 목록에 맞게 설정하세요. 예를 들어, 기침/재채기/코막힘이면 '호흡기', 구토/설사면 '소화기'입니다.\n");
        prompt.append("5. 긴급도는 응급 상황 체크와 증상의 심각도를 종합하여 판단하세요.\n");
        prompt.append("6. 반려동물의 종류, 나이, 몸무게를 고려하여 적절한 진단을 내리세요.\n");
        prompt.append("7. 가능한 질환 후보를 확률 순으로 정렬하세요.\n");
        prompt.append("8. 각 질환에 대해 매우 상세하고 전문적인 설명을 제공하세요.\n");
        prompt.append("9. 【절대 금지】증상과 일치하지 않는 카테고리로 분류하지 마세요. 예를 들어, 기침/재채기 증상인데 '소화기'로 분류하면 안 됩니다.\n");
        prompt.append("\n다음 JSON 형식으로 응답해주세요:\n");
        prompt.append("{\n");
        prompt.append("  \"urgencyLevel\": \"low|medium|high|emergency\",\n");
        prompt.append("  \"category\": \"소화기|호흡기|정형외과|피부과|신경과|안과|기타\",\n");
        prompt.append("  \"recommendedDepartment\": \"내과|외과|정형외과|피부과|신경과|안과\",\n");
        prompt.append("  \"detailedAnalysis\": \"증상에 대한 종합적인 분석과 설명 (3-4문장, 간단하고 이해하기 쉽게)\",\n");
        prompt.append("  \"diseaseCandidates\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"name\": \"질환명\",\n");
        prompt.append("      \"description\": \"질환에 대한 간단한 설명 (2-3문장, 일반인이 이해하기 쉽게)\",\n");
        prompt.append("      \"symptoms\": \"이 질환에서 나타나는 주요 증상들 (간단하게 나열)\",\n");
        prompt.append("      \"cause\": \"발생 원인 (간단하게 1-2문장)\",\n");
        prompt.append("      \"treatment\": \"치료 방법 (간단하게 2-3문장)\",\n");
        prompt.append("      \"prevention\": \"예방 방법 (간단하게 1-2문장)\",\n");
        prompt.append("      \"probability\": 0.0~1.0\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n");
        prompt.append("\n=== 중요 사항 ===\n");
        prompt.append("1. 【필수】가능한 질환 후보를 2-3개 제시하되, 반드시 선택한 증상 목록과 증상 상세 설명에 맞는 질환을 추론하세요.\n");
        prompt.append("2. 【필수】카테고리는 선택한 증상에 맞게 설정하세요. 기침/재채기/코막힘이면 '호흡기', 구토/설사면 '소화기'입니다.\n");
        prompt.append("3. 【필수】증상이 다르면 질환 후보도 달라야 합니다. 증상에 따라 다른 분석 결과를 제공하세요.\n");
        prompt.append("4. 【중요】모든 설명은 일반 보호자가 이해하기 쉽게 간단하고 명확하게 작성하세요. 전문 용어는 피하고 일상 언어를 사용하세요.\n");
        prompt.append("5. 【중요】각 질환의 설명은 2-3문장으로 간결하게, 증상/원인/치료/예방도 각각 1-2문장으로 간단하게 작성하세요.\n");
        prompt.append("6. 증상 상세 설명에 언급된 구체적인 증상들을 반드시 질환 분석에 반영하세요.\n");
        prompt.append("7. 【절대 금지】선택한 증상과 일치하지 않는 카테고리로 분류하지 마세요.");
        
        return prompt.toString();
    }
    
    private String buildRecommendationPrompt(AnalysisResult analysisResult, String userLocation, List<Hospital> hospitals) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("당신은 반려동물 보호자를 위한 상담사입니다. AI 분석 결과를 바탕으로 보호자에게 친절하고 이해하기 쉬운 안내 메시지를 작성하고, 병원을 추천해주세요.\n\n");
        prompt.append("=== 분석 결과 ===\n");
        prompt.append("- 긴급도: ").append(analysisResult.getUrgencyLevel()).append("\n");
        prompt.append("- 증상 카테고리: ").append(analysisResult.getCategory()).append("\n");
        prompt.append("- 추천 진료과: ").append(analysisResult.getRecommendedDepartment()).append("\n");
        
        if (analysisResult.getDetailedAnalysis() != null && !analysisResult.getDetailedAnalysis().trim().isEmpty()) {
            prompt.append("- 상세 분석: ").append(analysisResult.getDetailedAnalysis()).append("\n");
        }
        
        if (analysisResult.getDiseaseCandidates() != null && !analysisResult.getDiseaseCandidates().isEmpty()) {
            prompt.append("- 가능한 질환:\n");
            analysisResult.getDiseaseCandidates().forEach(disease -> {
                prompt.append("  * ").append(disease.getName());
                if (disease.getProbability() != null) {
                    prompt.append(" (가능성: ").append(String.format("%.1f", disease.getProbability() * 100)).append("%)");
                }
                prompt.append("\n");
            });
        }
        prompt.append("\n사용자 위치: ").append(userLocation).append("\n");
        prompt.append("\n사용 가능한 병원 목록 (총 ").append(hospitals.size()).append("개):\n");
        for (int i = 0; i < hospitals.size() && i < 15; i++) {
            Hospital h = hospitals.get(i);
            prompt.append(i + 1).append(". 병원ID: ").append(h.getId()).append(" - ").append(h.getName()).append("\n");
            prompt.append("   주소: ").append(h.getAddress()).append("\n");
            prompt.append("   전화: ").append(h.getPhone()).append("\n");
            prompt.append("   운영시간: ").append(h.getOperatingHours()).append("\n");
            prompt.append("   진료과: ").append(String.join(", ", h.getDepartments())).append("\n");
            if (h.getDistanceKm() != null) {
                prompt.append("   거리: ").append(String.format("%.1f", h.getDistanceKm())).append("km\n");
            }
            prompt.append("\n");
        }
        prompt.append("\n다음 JSON 형식으로 응답해주세요:\n");
        prompt.append("{\n");
        prompt.append("  \"userFriendlyMessage\": \"보호자에게 전달할 친절하고 간단한 안내 메시지 (4-5문장). ");
        prompt.append("증상의 심각도, 병원 방문 시기, 주의사항을 간단하고 이해하기 쉽게 설명하세요.\",\n");
        prompt.append("  \"immediateActions\": \"즉시 취해야 할 조치사항 (2-3가지, 간단하게)\",\n");
        prompt.append("  \"watchFor\": \"주의 깊게 관찰해야 할 증상들 (2-3가지, 간단하게)\",\n");
        prompt.append("  \"recommendedHospitals\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"hospitalId\": \"병원ID\",\n");
        prompt.append("      \"recommendationReason\": \"이 병원을 추천하는 상세한 이유 (3-4문장, 거리, 진료과, 전문성 등을 포함)\"\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n");
        prompt.append("\n=== 중요 사항 ===\n");
        prompt.append("1. 【필수】반드시 정확히 3개의 병원을 추천해야 합니다. 병원이 3개 미만이면 사용 가능한 병원 중에서 가장 적합한 것을 선택하여 총 3개를 채우세요.\n");
        prompt.append("2. 【필수】보호자 안내 메시지는 반드시 위의 분석 결과에 맞춰 간단하고 이해하기 쉽게 작성하세요 (4-5문장).\n");
        prompt.append("3. 【필수】분석 결과의 카테고리와 질환에 맞는 조치사항을 제시하세요. 예를 들어, 호흡기 증상이면 호흡기 관련 조치를, 소화기 증상이면 소화기 관련 조치를 제시하세요.\n");
        prompt.append("4. 【필수】증상이 다르면 안내 메시지도 달라야 합니다. 이전 분석과 동일한 메시지를 반환하지 마세요.\n");
        prompt.append("5. 【중요】모든 메시지는 일반 보호자가 쉽게 이해할 수 있도록 간단하고 명확하게 작성하세요. 전문 용어는 피하세요.\n");
        prompt.append("6. 즉시 조치사항과 주의 관찰 증상은 각각 2-3가지로 간단하게 나열하세요.\n");
        prompt.append("7. 【절대 금지】분석 결과와 일치하지 않는 조치사항을 제시하지 마세요. 예를 들어, 호흡기 증상인데 구토/설사 관련 조치를 제시하면 안 됩니다.");
        
        return prompt.toString();
    }
    
    private String callGemini(String prompt) {
        int maxRetries = 3;
        long baseDelayMs = 1000; // 1초 (Gemini는 더 빠름)
        
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Gemini API 요청 형식
                Map<String, Object> requestBody = new HashMap<>();
                
                // contents 배열 구성
                List<Map<String, Object>> contents = new ArrayList<>();
                Map<String, Object> content = new HashMap<>();
                List<Map<String, String>> parts = new ArrayList<>();
                Map<String, String> part = new HashMap<>();
                part.put("text", prompt);
                parts.add(part);
                content.put("parts", parts);
                contents.add(content);
                requestBody.put("contents", contents);
                
                // Generation config
                Map<String, Object> generationConfig = new HashMap<>();
                generationConfig.put("temperature", 0.8);
                generationConfig.put("topK", 40);
                generationConfig.put("topP", 0.95);
                generationConfig.put("maxOutputTokens", 8192);
                requestBody.put("generationConfig", generationConfig);
                
                String jsonBody = objectMapper.writeValueAsString(requestBody);
                
                // Gemini API 엔드포인트: /models/{model}:generateContent?key={apiKey}
                String endpoint = "/models/" + model + ":generateContent?key=" + apiKey;
                
                Mono<String> responseMono = webClient.post()
                        .uri(endpoint)
                        .bodyValue(jsonBody)
                        .retrieve()
                        .bodyToMono(String.class);
                
                return responseMono.block();
                
            } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
                int statusCode = e.getStatusCode().value();
                
                // 429 Too Many Requests 또는 503 Service Unavailable 오류 처리 (재시도 가능)
                if (statusCode == 429 || statusCode == 503) {
                    if (attempt < maxRetries) {
                        long delayMs = baseDelayMs * (long) Math.pow(2, attempt - 1); // 지수 백오프: 1초, 2초, 4초
                        String errorType = statusCode == 429 ? "Rate Limit" : "Service Unavailable (모델 과부하)";
                        System.out.println("⚠️ " + errorType + " 도달. " + delayMs + "ms 후 재시도합니다... (시도 " + attempt + "/" + maxRetries + ")");
                        try {
                            Thread.sleep(delayMs);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("재시도 중단됨", ie);
                        }
                        continue; // 재시도
                    } else {
                        String errorType = statusCode == 429 ? "Rate Limit" : "Service Unavailable";
                        System.err.println("❌ " + errorType + " 오류: 최대 재시도 횟수 초과. 잠시 후 다시 시도해주세요.");
                        throw new RuntimeException("Gemini API 호출 실패: " + errorType + " (" + statusCode + "). 잠시 후 다시 시도해주세요.", e);
                    }
                } else {
                    // 다른 HTTP 오류는 즉시 throw
                    throw new RuntimeException("Gemini API 호출 실패: " + e.getStatusCode() + " " + e.getMessage(), e);
                }
            } catch (Exception e) {
                throw new RuntimeException("Gemini API 호출 실패: " + e.getMessage(), e);
            }
        }
        
        throw new RuntimeException("Gemini API 호출 실패: 최대 재시도 횟수 초과");
    }
    
    private AnalysisResult parseAnalysisResponse(String response, String petId) {
        try {
            JsonNode root = objectMapper.readTree(response);
            
            // Gemini API 응답 형식: candidates[0].content.parts[0].text
            JsonNode candidates = root.get("candidates");
            if (candidates == null || !candidates.isArray() || candidates.size() == 0) {
                throw new RuntimeException("API 응답 형식 오류: candidates가 없습니다");
            }
            
            JsonNode candidate = candidates.get(0);
            JsonNode content = candidate.get("content");
            if (content == null) {
                throw new RuntimeException("API 응답 형식 오류: content가 없습니다");
            }
            
            JsonNode parts = content.get("parts");
            if (parts == null || !parts.isArray() || parts.size() == 0) {
                throw new RuntimeException("API 응답 형식 오류: parts가 없습니다");
            }
            
            String contentText = parts.get(0).get("text").asText();
            
            // JSON 부분만 추출 (마크다운 코드 블록 제거)
            contentText = contentText.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            
            JsonNode analysisJson = objectMapper.readTree(contentText);
            
            AnalysisResult result = new AnalysisResult();
            result.setPetId(petId);
            result.setSymptomId("symptom_" + System.currentTimeMillis());
            result.setUrgencyLevel(analysisJson.get("urgencyLevel").asText());
            result.setCategory(analysisJson.get("category").asText());
            result.setRecommendedDepartment(analysisJson.get("recommendedDepartment").asText());
            result.setDetailedAnalysis(analysisJson.has("detailedAnalysis") ? analysisJson.get("detailedAnalysis").asText() : "");
            
            List<AnalysisResult.DiseaseCandidate> diseaseCandidates = new ArrayList<>();
            JsonNode diseases = analysisJson.get("diseaseCandidates");
            if (diseases != null && diseases.isArray()) {
                for (JsonNode disease : diseases) {
                    AnalysisResult.DiseaseCandidate diseaseCandidate = new AnalysisResult.DiseaseCandidate();
                    diseaseCandidate.setName(disease.get("name").asText());
                    diseaseCandidate.setDescription(disease.has("description") ? disease.get("description").asText() : "");
                    diseaseCandidate.setSymptoms(disease.has("symptoms") ? disease.get("symptoms").asText() : "");
                    diseaseCandidate.setCause(disease.has("cause") ? disease.get("cause").asText() : "");
                    diseaseCandidate.setTreatment(disease.has("treatment") ? disease.get("treatment").asText() : "");
                    diseaseCandidate.setPrevention(disease.has("prevention") ? disease.get("prevention").asText() : "");
                    diseaseCandidate.setProbability(disease.has("probability") ? disease.get("probability").asDouble() : 0.5);
                    diseaseCandidates.add(diseaseCandidate);
                }
            }
            result.setDiseaseCandidates(diseaseCandidates);
            
            return result;
        } catch (Exception e) {
            throw new RuntimeException("응답 파싱 실패: " + e.getMessage(), e);
        }
    }
    
    private HospitalRecommendation parseRecommendationResponse(String response, AnalysisResult analysisResult, List<Hospital> hospitals) {
        try {
            JsonNode root = objectMapper.readTree(response);
            
            // Gemini API 응답 형식: candidates[0].content.parts[0].text
            JsonNode candidates = root.get("candidates");
            if (candidates == null || !candidates.isArray() || candidates.size() == 0) {
                throw new RuntimeException("API 응답 형식 오류: candidates가 없습니다");
            }
            
            JsonNode candidate = candidates.get(0);
            JsonNode content = candidate.get("content");
            if (content == null) {
                throw new RuntimeException("API 응답 형식 오류: content가 없습니다");
            }
            
            JsonNode parts = content.get("parts");
            if (parts == null || !parts.isArray() || parts.size() == 0) {
                throw new RuntimeException("API 응답 형식 오류: parts가 없습니다");
            }
            
            String contentText = parts.get(0).get("text").asText();
            contentText = contentText.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            
            JsonNode recJson = objectMapper.readTree(contentText);
            
            HospitalRecommendation recommendation = new HospitalRecommendation();
            recommendation.setAnalysisResult(analysisResult);
            recommendation.setUserFriendlyMessage(recJson.get("userFriendlyMessage").asText());
            recommendation.setImmediateActions(recJson.has("immediateActions") ? recJson.get("immediateActions").asText() : "");
            recommendation.setWatchFor(recJson.has("watchFor") ? recJson.get("watchFor").asText() : "");
            
            List<HospitalRecommendation.RecommendedHospital> recommendedHospitals = new ArrayList<>();
            JsonNode recHospitals = recJson.get("recommendedHospitals");
            System.out.println("AI 추천 병원 수: " + (recHospitals != null && recHospitals.isArray() ? recHospitals.size() : 0));
            
            if (recHospitals != null && recHospitals.isArray()) {
                // AI가 추천한 병원들 추가
                for (JsonNode recHospital : recHospitals) {
                    if (recommendedHospitals.size() >= 3) break; // 최대 3개로 제한
                    
                    String hospitalId = recHospital.get("hospitalId").asText();
                    Hospital hospital = hospitals.stream()
                            .filter(h -> h.getId().equals(hospitalId))
                            .findFirst()
                            .orElse(null);
                    
                    if (hospital != null) {
                        HospitalRecommendation.RecommendedHospital rec = new HospitalRecommendation.RecommendedHospital();
                        rec.setHospital(hospital);
                        rec.setRecommendationReason(recHospital.get("recommendationReason").asText());
                        rec.setPriority(recommendedHospitals.size() + 1);
                        recommendedHospitals.add(rec);
                        System.out.println("추천 병원 추가: " + hospital.getName() + " (ID: " + hospitalId + ")");
                    } else {
                        System.out.println("병원을 찾을 수 없음: " + hospitalId);
                    }
                }
                
                // AI가 3개 미만 추천한 경우, 나머지를 거리순으로 채움
                if (recommendedHospitals.size() < 3) {
                    System.out.println("⚠️ AI가 " + recommendedHospitals.size() + "개만 추천함. 나머지 " + (3 - recommendedHospitals.size()) + "개를 자동으로 추가합니다.");
                    System.out.println("사용 가능한 병원 수: " + hospitals.size());
                    
                    // 이미 추천된 병원 ID 목록
                    List<String> alreadyRecommendedIds = recommendedHospitals.stream()
                            .map(r -> r.getHospital().getId())
                            .collect(Collectors.toList());
                    
                    System.out.println("이미 추천된 병원 ID: " + alreadyRecommendedIds);
                    
                    // 거리순으로 정렬된 병원 목록에서 아직 추천되지 않은 병원 선택
                    List<Hospital> remainingHospitals = hospitals.stream()
                            .filter(h -> !alreadyRecommendedIds.contains(h.getId()))
                            .sorted((h1, h2) -> {
                                Double d1 = h1.getDistanceKm() != null ? h1.getDistanceKm() : Double.MAX_VALUE;
                                Double d2 = h2.getDistanceKm() != null ? h2.getDistanceKm() : Double.MAX_VALUE;
                                return d1.compareTo(d2);
                            })
                            .collect(Collectors.toList());
                    
                    System.out.println("남은 병원 수: " + remainingHospitals.size());
                    
                    int needed = 3 - recommendedHospitals.size();
                    for (int i = 0; i < needed && i < remainingHospitals.size(); i++) {
                        Hospital hospital = remainingHospitals.get(i);
                        HospitalRecommendation.RecommendedHospital rec = new HospitalRecommendation.RecommendedHospital();
                        rec.setHospital(hospital);
                        rec.setRecommendationReason("위치가 가깝고 접근성이 좋습니다.");
                        rec.setPriority(recommendedHospitals.size() + 1);
                        recommendedHospitals.add(rec);
                        System.out.println("✅ 자동 추가 병원: " + hospital.getName() + " (ID: " + hospital.getId() + ")");
                    }
                    
                    if (recommendedHospitals.size() < 3) {
                        System.out.println("⚠️ 경고: 여전히 " + recommendedHospitals.size() + "개만 있습니다. 사용 가능한 병원이 부족할 수 있습니다.");
                    }
                }
            } else {
                // AI 응답에 recommendedHospitals가 없는 경우, 거리순으로 3개 선택
                List<Hospital> sortedHospitals = hospitals.stream()
                        .sorted((h1, h2) -> {
                            Double d1 = h1.getDistanceKm() != null ? h1.getDistanceKm() : Double.MAX_VALUE;
                            Double d2 = h2.getDistanceKm() != null ? h2.getDistanceKm() : Double.MAX_VALUE;
                            return d1.compareTo(d2);
                        })
                        .limit(3)
                        .collect(Collectors.toList());
                
                for (int i = 0; i < sortedHospitals.size(); i++) {
                    Hospital hospital = sortedHospitals.get(i);
                    HospitalRecommendation.RecommendedHospital rec = new HospitalRecommendation.RecommendedHospital();
                    rec.setHospital(hospital);
                    rec.setRecommendationReason("위치가 가깝고 해당 진료과를 운영합니다.");
                    rec.setPriority(i + 1);
                    recommendedHospitals.add(rec);
                }
            }
            recommendation.setRecommendedHospitals(recommendedHospitals);
            System.out.println("최종 추천 병원 수: " + recommendedHospitals.size());
            
            return recommendation;
        } catch (Exception e) {
            throw new RuntimeException("응답 파싱 실패: " + e.getMessage(), e);
        }
    }
    
    // Mock 데이터 생성 (API 실패 시)
    private AnalysisResult createMockAnalysisResult(String petId) {
        AnalysisResult result = new AnalysisResult();
        result.setPetId(petId);
        result.setSymptomId("symptom_" + System.currentTimeMillis());
        result.setUrgencyLevel("medium");
        result.setCategory("소화기");
        result.setRecommendedDepartment("내과");
        return result;
    }
    
    private HospitalRecommendation createMockRecommendation(AnalysisResult analysisResult, List<Hospital> hospitals) {
        HospitalRecommendation recommendation = new HospitalRecommendation();
        recommendation.setAnalysisResult(analysisResult);
        recommendation.setUserFriendlyMessage(
            "반려동물의 증상을 분석한 결과, 소화기 문제일 가능성이 있습니다. " +
            "응급 상황은 아니지만, 24시간 이내 내원을 권장드립니다. " +
            "병원 방문 전까지 반려동물의 상태를 주의 깊게 관찰하시고, 증상이 악화되면 즉시 응급실로 가시기 바랍니다."
        );
        recommendation.setImmediateActions("1. 반려동물을 편안한 곳에 두고 휴식을 취하게 하세요. 2. 물은 충분히 제공하되 음식은 조금만 주세요. 3. 구토나 설사가 계속되면 수분 공급에 주의하세요.");
        recommendation.setWatchFor("1. 구토나 설사 빈도 증가. 2. 탈수 증상 (입술 건조, 피부 탄력 저하). 3. 무기력증이나 식욕 부진.");
        
        List<HospitalRecommendation.RecommendedHospital> recommendedHospitals = new ArrayList<>();
        for (int i = 0; i < Math.min(3, hospitals.size()); i++) {
            HospitalRecommendation.RecommendedHospital rec = new HospitalRecommendation.RecommendedHospital();
            rec.setHospital(hospitals.get(i));
            rec.setRecommendationReason("위치가 가깝고 해당 진료과를 운영합니다.");
            rec.setPriority(i + 1);
            recommendedHospitals.add(rec);
        }
        recommendation.setRecommendedHospitals(recommendedHospitals);
        
        return recommendation;
    }
}
