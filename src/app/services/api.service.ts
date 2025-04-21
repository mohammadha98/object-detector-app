import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
interface AnalyzeResponse {
  description: string;
  audio_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'http://objectdetector.runflare.run/analyze-image/';

  constructor(private http: HttpClient) { }

  analyzeImage(image: File): Observable<AnalyzeResponse> {
    const formData = new FormData();
    formData.append('image', image);

    return this.http.post<AnalyzeResponse>(this.apiUrl, formData);
  }
}
