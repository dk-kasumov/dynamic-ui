import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NgxStudio } from './ngx-studio'

describe('NgxStudio', () => {
  let component: NgxStudio
  let fixture: ComponentFixture<NgxStudio>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxStudio]
    }).compileComponents()

    fixture = TestBed.createComponent(NgxStudio)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
