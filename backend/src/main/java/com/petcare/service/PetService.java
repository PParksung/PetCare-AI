package com.petcare.service;

import com.petcare.model.Pet;
import com.petcare.util.FileDataManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class PetService {
    
    private static final String PETS_FILE = "pets.json";
    
    @Autowired
    private FileDataManager fileDataManager;
    
    public Pet registerPet(Pet pet) throws IOException {
        pet.setId(UUID.randomUUID().toString());
        List<Pet> pets = getAllPets();
        pets.add(pet);
        fileDataManager.saveListToFile(PETS_FILE, pets);
        return pet;
    }
    
    public Pet getPetById(String id) throws IOException {
        return getAllPets().stream()
                .filter(p -> p.getId().equals(id))
                .findFirst()
                .orElse(null);
    }
    
    public List<Pet> getAllPets() throws IOException {
        return fileDataManager.loadListFromFile(PETS_FILE, Pet.class);
    }
    
    public Pet updatePet(Pet pet) throws IOException {
        List<Pet> pets = getAllPets();
        for (int i = 0; i < pets.size(); i++) {
            if (pets.get(i).getId().equals(pet.getId())) {
                pets.set(i, pet);
                fileDataManager.saveListToFile(PETS_FILE, pets);
                return pet;
            }
        }
        throw new IllegalArgumentException("반려동물을 찾을 수 없습니다.");
    }
    
    public void deletePet(String id) throws IOException {
        List<Pet> pets = getAllPets();
        pets.removeIf(p -> p.getId().equals(id));
        fileDataManager.saveListToFile(PETS_FILE, pets);
    }
}

